#!/usr/bin/env python3
"""
WooCommerce data extractor for Grupo Lambea
Generates: wc-seo-data.json, wc-variants-data.json, wc-redirects-map.json
"""

import json
import time
import subprocess
import urllib.parse

BASE_URL = "https://grupolambea.com"
CONSUMER_KEY = "ck_d0d8902a344e4fb3bccc3f6564c568dfa65f1b4c"
CONSUMER_SECRET = "cs_d9e5d201f5515a32a26ffcf44c4e403a80e0124f"
OUTPUT_DIR = "/Users/adria/Projects/Grupolambea"


def make_request(url, retries=3):
    """Make an API request via curl with retry logic (avoids WAF blocks on urllib)."""
    for attempt in range(retries):
        try:
            result = subprocess.run(
                [
                    'curl', '-s', '-D', '-',
                    '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    '--compressed',
                    url,
                ],
                capture_output=True, text=True, timeout=60
            )
            if result.returncode != 0:
                raise Exception(f"curl failed with return code {result.returncode}: {result.stderr}")

            output = result.stdout
            # Split headers from body (curl -D - puts headers first then blank line then body)
            header_end = output.find('\r\n\r\n')
            if header_end == -1:
                header_end = output.find('\n\n')
                sep = '\n\n'
            else:
                sep = '\r\n\r\n'

            headers_raw = output[:header_end]
            body = output[header_end + len(sep):]

            # Parse headers
            headers = {}
            for line in headers_raw.split('\n'):
                line = line.strip()
                if ':' in line and not line.startswith('HTTP/'):
                    key, _, value = line.partition(':')
                    headers[key.strip().lower()] = value.strip()

            # Check HTTP status
            first_line = headers_raw.split('\n')[0].strip()
            if first_line.startswith('HTTP/'):
                status_code = int(first_line.split()[1])
                if status_code >= 400:
                    raise Exception(f"HTTP {status_code}: {first_line}")

            return json.loads(body), headers

        except Exception as e:
            print(f"  Error for {url} (attempt {attempt+1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(2)
            else:
                raise


def get_all_products():
    """Fetch all products from WooCommerce API, paginating as needed."""
    all_products = []
    page = 1
    total_pages = None

    while True:
        params = urllib.parse.urlencode({
            'consumer_key': CONSUMER_KEY,
            'consumer_secret': CONSUMER_SECRET,
            'per_page': 100,
            'page': page,
            'status': 'any',
        })
        url = f"{BASE_URL}/wp-json/wc/v3/products?{params}"
        print(f"Fetching products page {page}...")

        data, headers = make_request(url)

        if total_pages is None:
            total = headers.get('X-Wp-Total', headers.get('x-wp-total', '?'))
            total_pages_str = headers.get('X-Wp-Totalpages', headers.get('x-wp-totalpages', '1'))
            total_pages = int(total_pages_str)
            print(f"  Total products: {total}, Total pages: {total_pages}")

        all_products.extend(data)
        print(f"  Got {len(data)} products (running total: {len(all_products)})")

        if page >= total_pages:
            break
        page += 1
        time.sleep(0.5)  # Be polite to the server

    return all_products


def get_variations(product_id):
    """Fetch all variations for a variable product."""
    all_variations = []
    page = 1

    while True:
        params = urllib.parse.urlencode({
            'consumer_key': CONSUMER_KEY,
            'consumer_secret': CONSUMER_SECRET,
            'per_page': 100,
            'page': page,
        })
        url = f"{BASE_URL}/wp-json/wc/v3/products/{product_id}/variations?{params}"

        data, headers = make_request(url)
        all_variations.extend(data)

        total_pages_str = headers.get('X-Wp-Totalpages', headers.get('x-wp-totalpages', '1'))
        total_pages = int(total_pages_str)

        if page >= total_pages:
            break
        page += 1
        time.sleep(0.3)

    return all_variations


def extract_yoast_data(product):
    """Extract Yoast SEO data from product."""
    yoast = product.get('yoast_head_json', {}) or {}

    # Extract og_images URLs
    og_images_raw = yoast.get('og_image', [])
    og_image_urls = []
    if isinstance(og_images_raw, list):
        for img in og_images_raw:
            if isinstance(img, dict) and 'url' in img:
                og_image_urls.append(img['url'])
            elif isinstance(img, str):
                og_image_urls.append(img)

    return {
        'yoast_title': yoast.get('title', ''),
        'yoast_description': yoast.get('description', ''),
        'yoast_og_description': yoast.get('og_description', ''),
        'yoast_og_images': og_image_urls,
    }


def get_permalink_path(permalink):
    """Extract path from full permalink URL."""
    if not permalink:
        return ''
    # Remove base URL to get just the path
    path = permalink.replace(BASE_URL, '')
    if not path:
        path = '/'
    return path


def main():
    print("=" * 60)
    print("WooCommerce Data Extractor — Grupo Lambea")
    print("=" * 60)

    # Step 1: Fetch all products
    print("\n[1/3] Fetching all products...")
    products = get_all_products()
    print(f"Total products fetched: {len(products)}")

    # Counters for summary
    total_variable = 0
    total_simple = 0
    total_variations = 0
    total_variations_with_image = 0

    # Output data structures
    seo_data = []
    variants_data = []
    redirects_map = []

    # Step 2: Process each product
    print(f"\n[2/3] Processing {len(products)} products...")

    for i, product in enumerate(products):
        wc_id = product.get('id')
        wc_slug = product.get('slug', '')
        wc_name = product.get('name', '')
        wc_permalink = product.get('permalink', '')
        product_type = product.get('type', 'simple')
        status = product.get('status', 'publish')

        print(f"  [{i+1}/{len(products)}] ID {wc_id}: {wc_name[:60]}... ({product_type}, {status})")

        # Extract Yoast SEO data
        yoast = extract_yoast_data(product)

        # Build SEO entry
        seo_entry = {
            'wc_id': wc_id,
            'wc_slug': wc_slug,
            'wc_permalink': wc_permalink,
            'wc_name': wc_name,
            'wc_type': product_type,
            'status': status,
            'yoast_title': yoast['yoast_title'],
            'yoast_description': yoast['yoast_description'],
            'yoast_og_description': yoast['yoast_og_description'],
            'yoast_og_images': yoast['yoast_og_images'],
        }
        seo_data.append(seo_entry)

        # Build redirects entry
        redirects_map.append({
            'wc_id': wc_id,
            'wc_slug': wc_slug,
            'wc_permalink_path': get_permalink_path(wc_permalink),
            'wc_name': wc_name,
            'wc_type': product_type,
            'status': status,
        })

        # Process variations
        if product_type == 'variable':
            total_variable += 1
            variation_ids = product.get('variations', [])

            if variation_ids:
                print(f"    Fetching {len(variation_ids)} variations...")
                try:
                    variations_raw = get_variations(wc_id)

                    processed_variations = []
                    for var in variations_raw:
                        var_image = var.get('image', {}) or {}
                        image_url = var_image.get('src', '') if var_image else ''

                        if image_url:
                            total_variations_with_image += 1

                        processed_variations.append({
                            'variation_id': var.get('id'),
                            'price': var.get('price', ''),
                            'regular_price': var.get('regular_price', ''),
                            'sale_price': var.get('sale_price', ''),
                            'sku': var.get('sku', ''),
                            'status': var.get('status', 'publish'),
                            'attributes': var.get('attributes', []),
                            'image_url': image_url,
                            'stock_status': var.get('stock_status', ''),
                        })
                        total_variations += 1

                    variants_data.append({
                        'wc_id': wc_id,
                        'wc_name': wc_name,
                        'wc_slug': wc_slug,
                        'variations': processed_variations,
                    })

                    print(f"    Got {len(processed_variations)} variations "
                          f"({sum(1 for v in processed_variations if v['image_url'])} with images)")

                except Exception as e:
                    print(f"    ERROR fetching variations: {e}")
                    variants_data.append({
                        'wc_id': wc_id,
                        'wc_name': wc_name,
                        'wc_slug': wc_slug,
                        'variations': [],
                        'error': str(e),
                    })
            else:
                variants_data.append({
                    'wc_id': wc_id,
                    'wc_name': wc_name,
                    'wc_slug': wc_slug,
                    'variations': [],
                })

        else:
            total_simple += 1
            # For simple products, use the main image
            images = product.get('images', [])
            main_image = images[0].get('src', '') if images else ''

            variants_data.append({
                'wc_id': wc_id,
                'wc_name': wc_name,
                'wc_slug': wc_slug,
                'variations': [{
                    'variation_id': None,
                    'price': product.get('price', ''),
                    'regular_price': product.get('regular_price', ''),
                    'sale_price': product.get('sale_price', ''),
                    'sku': product.get('sku', ''),
                    'status': status,
                    'attributes': [],
                    'image_url': main_image,
                    'stock_status': product.get('stock_status', ''),
                }],
            })
            if main_image:
                total_variations_with_image += 1
            total_variations += 1

        time.sleep(0.3)  # Polite delay between products

    # Step 3: Save output files
    print(f"\n[3/3] Saving output files to {OUTPUT_DIR}/...")

    seo_path = f"{OUTPUT_DIR}/wc-seo-data.json"
    with open(seo_path, 'w', encoding='utf-8') as f:
        json.dump(seo_data, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {seo_path} ({len(seo_data)} entries)")

    variants_path = f"{OUTPUT_DIR}/wc-variants-data.json"
    with open(variants_path, 'w', encoding='utf-8') as f:
        json.dump(variants_data, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {variants_path} ({len(variants_data)} entries)")

    redirects_path = f"{OUTPUT_DIR}/wc-redirects-map.json"
    with open(redirects_path, 'w', encoding='utf-8') as f:
        json.dump(redirects_map, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {redirects_path} ({len(redirects_map)} entries)")

    # Summary
    print("\n" + "=" * 60)
    print("RESUMEN FINAL")
    print("=" * 60)
    print(f"  Total productos procesados: {len(products)}")
    print(f"  Productos de tipo 'variable': {total_variable}")
    print(f"  Productos de tipo 'simple':   {total_simple}")
    print(f"  Total variantes:              {total_variations}")
    print(f"  Variantes con imagen propia:  {total_variations_with_image}")
    print(f"  Variantes sin imagen:         {total_variations - total_variations_with_image}")
    print("=" * 60)
    print("Archivos generados:")
    print(f"  {seo_path}")
    print(f"  {variants_path}")
    print(f"  {redirects_path}")


if __name__ == '__main__':
    main()
