"""Offline checks for accurate page-view snapshots and read-only requests."""
import io
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from update_usecase_views import read_count


class PageViewsTest(unittest.TestCase):
    @patch('update_usecase_views.urlopen')
    def test_reads_total_without_badge_increment(self, request):
        request.return_value = io.BytesIO(b'{"total":42}')
        self.assertEqual(read_count('/usecases/1/'), ('/usecases/1/', 42))
        request.assert_called_once_with(
            'https://hits.sh/api/urns/deepagentlabs.io/usecases/1', timeout=15)

    @patch('update_usecase_views.urlopen')
    def test_uninitialized_is_zero(self, request):
        request.side_effect = HTTPError('', 404, '', None, None)
        self.assertEqual(read_count('/usecases/1/')[1], 0)

    @patch('update_usecase_views.urlopen')
    def test_errors_and_invalid_values_are_not_zero(self, request):
        for value in [b'{"total":-1}', b'{"total":true}', b'{}', b'not json']:
            request.return_value = io.BytesIO(value)
            self.assertIsNone(read_count('/usecases/1/')[1])
        for error in [OSError('offline'), HTTPError('', 503, '', None, None)]:
            request.side_effect = error
            self.assertIsNone(read_count('/usecases/1/')[1])


if __name__ == '__main__':
    unittest.main()
