"use client";
import { useCart } from '../context/cart-context';
import { useState } from 'react';

export default function CartDebugPage() {
  const { state, refreshCart } = useCart();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleDebug = async () => {
    try {
      await refreshCart();
      setDebugInfo({
        timestamp: new Date().toISOString(),
        cartState: state,
        localStorage: {
          authToken: localStorage.getItem('authToken') ? 'Present' : 'Missing',
          user: localStorage.getItem('user') ? 'Present' : 'Missing'
        }
      });
    } catch (error) {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        cartState: state
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Cart Integration Debug</h1>
          
          <div className="mb-6">
            <button
              onClick={handleDebug}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Test Cart Integration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Current Cart State</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(state, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Debug Information</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm overflow-auto">
                  {debugInfo ? JSON.stringify(debugInfo, null, 2) : 'Click "Test Cart Integration" to see debug info'}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Backend API Endpoints</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <ul className="text-sm space-y-2">
                <li><strong>GET Cart:</strong> POST /customer/get-all-carts</li>
                <li><strong>ADD Item:</strong> POST /customer/add-to-cart</li>
                <li><strong>UPDATE Item:</strong> PUT /customer/update-cart</li>
                <li><strong>REMOVE Item:</strong> DELETE /customer/remove-from-cart</li>
                <li><strong>CLEAR Cart:</strong> DELETE /customer/clear-cart</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Expected Backend Response Formats</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-sm space-y-2">
                <div>
                  <strong>Format 1:</strong> <code>{`{ cartProducts: [...] }`}</code>
                </div>
                <div>
                  <strong>Format 2:</strong> <code>{`{ cart: { cartProducts: [...] } }`}</code>
                </div>
                <div>
                  <strong>Format 3:</strong> <code>{`[CartProduct, ...]`}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Troubleshooting</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <ul className="text-sm space-y-1">
                <li>• Make sure your backend server is running on http://localhost:3000</li>
                <li>• Ensure you're logged in (check localStorage for authToken and user)</li>
                <li>• Check browser console for detailed error messages</li>
                <li>• Verify your backend endpoints return data in one of the expected formats</li>
                <li>• Check network tab in browser dev tools for API call details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
