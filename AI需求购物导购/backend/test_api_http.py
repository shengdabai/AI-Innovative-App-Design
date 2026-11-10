"""Exercise the real ASGI boundary after updating FastAPI and Starlette."""
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from app.main import app, need_analyzer


class AnalysisHTTPTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.addCleanup(self.client.close)

    def test_valid_input_is_trimmed_and_serialized(self):
        response = self.client.post('/api/analyze', json={'text': '  遮光眼罩  '})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['original_input'], '遮光眼罩')
        self.assertIsInstance(response.json()['products'], list)

    def test_invalid_inputs_never_reach_the_analyzer(self):
        with patch.object(need_analyzer, 'analyze_user_need') as analyze:
            for value in ['', '  ', 'x' * 2001, None, {'text': 'nested'}]:
                with self.subTest(value=str(value)[:30]):
                    response = self.client.post('/api/analyze', json={'text': value})
                    self.assertEqual(response.status_code, 422)
            analyze.assert_not_called()

    def test_internal_error_is_not_returned(self):
        with patch.object(need_analyzer, 'analyze_user_need', side_effect=RuntimeError('private detail')):
            response = self.client.post('/api/analyze', json={'text': '遮光眼罩'})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json(), {'detail': 'Analysis service temporarily unavailable'})


if __name__ == '__main__':
    unittest.main()
