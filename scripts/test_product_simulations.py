"""Validate demo data and generated static product content without dependencies."""
import json
import unittest
from html.parser import HTMLParser

from sync_product_simulations import DEMOS, ROOT, HeroEnd, render


class Frames(HTMLParser):
    def __init__(self):
        super().__init__()
        self.capture = False
        self.content = ''

    def handle_starttag(self, tag, attrs):
        self.capture = tag == 'script' and 'data-sim-frames' in dict(attrs)

    def handle_data(self, data):
        if self.capture:
            self.content += data


class SimulationTests(unittest.TestCase):
    def test_all_product_pages_have_current_demo_after_hero(self):
        for demo in DEMOS:
            with self.subTest(product=demo['key']):
                source = (ROOT / demo['path']).read_text()
                parser = HeroEnd(source)
                parser.feed(source)
                self.assertIsNotNone(parser.end)
                self.assertGreater(source.index('<!-- product-simulation:start -->'), parser.end)
                self.assertIn(render(demo), source)
                parser = Frames()
                parser.feed(render(demo))
                self.assertEqual(json.loads(parser.content), demo['frames'])

    def test_each_frame_has_complete_rows_metrics_and_valid_waterfall(self):
        for demo in DEMOS:
            for frame in demo['frames']:
                self.assertEqual(len(frame['metrics']), len(demo['metrics']))
                self.assertEqual(len(frame['rows']), len(demo['names']))
                self.assertTrue(frame['event'])
                for row in frame['rows']:
                    self.assertIn(row[2], ('ok', 'warn', 'bad', 'muted'))
                    if len(row) > 3:
                        self.assertGreaterEqual(row[3], 0)
                        self.assertGreaterEqual(row[4], 0)
                        self.assertLessEqual(row[3] + row[4], 100)


if __name__ == '__main__':
    unittest.main()
