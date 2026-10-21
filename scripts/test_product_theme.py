"""Check that product landing pages share the Control Tower shell and keep anchors."""
import unittest
from html.parser import HTMLParser

from sync_product_simulations import DEMOS, ROOT
from unify_product_pages import PRODUCTS, Sections, shell


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.anchors = []
        self.styles = []
        self.mains = 0
        self.headers = 0
        self.footers = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a' and attrs.get('href', '').startswith('#'):
            self.anchors.append(attrs['href'][1:])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.styles.append(attrs['href'])
        if tag == 'main':
            self.mains += 1
        if tag == 'header' and attrs.get('class') == 'site-header':
            self.headers += 1
        if tag == 'footer':
            self.footers += 1


class ProductThemeTests(unittest.TestCase):
    def test_shared_shell_and_single_landmarks(self):
        header, footer = shell()
        for demo in DEMOS:
            with self.subTest(product=demo['key']):
                source = (ROOT / demo['path']).read_text()
                self.assertIn(header, source)
                self.assertIn(footer, source)
                self.assertIn('class="product-page uniform-product"', source)
                self.assertIn(PRODUCTS[demo['key']]['name'], source)
                page = Page()
                page.feed(source)
                self.assertEqual((page.headers, page.mains, page.footers), (1, 1, 1))
                self.assertFalse(set(page.anchors) - set(page.ids) - {''})
                self.assertEqual(len(page.ids), len(set(page.ids)))
                self.assertTrue(any('product-uniform.css' in href for href in page.styles))
                self.assertFalse(any(href == 'site.css' for href in page.styles))

    def test_preserved_content_sections_and_examples(self):
        minimum = {'lens': 6, 'evals': 5, 'sidecar': 7, 'chaos': 6, 'mcp': 6}
        for demo in DEMOS:
            source = (ROOT / demo['path']).read_text()
            parser = Sections(source)
            parser.feed(source)
            content = [html for attrs, html in parser.items if not {'pp-hero', 'dal-demo-section', 'product-end'}.intersection(attrs.get('class', '').split())]
            self.assertGreaterEqual(len(content), minimum[demo['key']])
            self.assertTrue(any('<pre' in html for html in content))


if __name__ == '__main__':
    unittest.main()
