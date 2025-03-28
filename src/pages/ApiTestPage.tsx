
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';

const ApiTestPage = () => {
  const [endpoint, setEndpoint] = useState<string>('/generate-khutab');
  const [method, setMethod] = useState<string>('POST');
  const [payload, setPayload] = useState<string>('{"purpose":"patience"}');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [headers, setHeaders] = useState<string>('{"Content-Type": "application/json"}');

  const testApi = async () => {
    try {
      setLoading(true);
      setResponse('');
      setStatus('');

      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const parsedHeaders = JSON.parse(headers);
      
      toast.loading('Testing API...', {
        id: 'api-test',
        duration: Infinity
      });
      
      console.log(`Testing API: ${method} ${fullUrl}`);
      console.log('Headers:', parsedHeaders);
      console.log('Payload:', payload);
      
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
        ...(method !== 'GET' && payload ? { body: payload } : {})
      };
      
      const response = await fetch(fullUrl, options);
      const statusText = `${response.status} ${response.statusText}`;
      setStatus(statusText);
      
      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      let responseBody;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseBody = await response.json();
        setResponse(JSON.stringify(responseBody, null, 2));
      } else {
        responseBody = await response.text();
        setResponse(responseBody);
      }
      
      console.log('Response status:', statusText);
      console.log('Response headers:', responseHeaders);
      console.log('Response body:', responseBody);
      
      toast.success(`Status: ${statusText}`, {
        id: 'api-test',
        duration: 3000
      });
      
    } catch (error) {
      console.error('API test error:', error);
      setStatus(error instanceof Error ? error.message : 'Unknown error');
      setResponse(error instanceof Error ? error.stack || error.message : 'Unknown error');
      
      toast.error('API Test Failed', {
        id: 'api-test',
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">API Testing</h1>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6 bg-card p-6 rounded-lg shadow-md">
            <div>
              <Label htmlFor="endpoint">API Endpoint</Label>
              <div className="flex items-center mt-1.5">
                <div className="bg-muted px-3 py-2 text-sm rounded-l-md border border-r-0 border-input">
                  {API_BASE_URL}
                </div>
                <Input 
                  id="endpoint"
                  value={endpoint} 
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="headers">Headers (JSON)</Label>
              <textarea
                id="headers"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="payload">Request Body (JSON)</Label>
              <textarea
                id="payload"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
              />
            </div>
            
            <Button 
              onClick={testApi} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Test API
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Response Status</h3>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  status.startsWith('2') ? 'bg-green-100 text-green-800' : 
                  status.startsWith('4') || status.startsWith('5') ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {status || 'No response yet'}
                </div>
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg shadow-md h-[500px] overflow-auto">
              <h3 className="font-medium mb-2">Response Body</h3>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto h-[90%]">
                {response || 'No response yet'}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-card p-6 rounded-lg shadow-md">
          <h3 className="font-medium mb-4">Quick Test Examples</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setEndpoint('/generate-khutab');
                setMethod('POST');
                setPayload('{"purpose":"patience"}');
                setHeaders('{"Content-Type": "application/json"}');
              }}
            >
              Generate Sermon (Patience)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setEndpoint('/generate-khutab');
                setMethod('POST');
                setPayload('{"purpose":"community"}');
                setHeaders('{"Content-Type": "application/json"}');
              }}
            >
              Generate Sermon (Community)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setEndpoint('/health');
                setMethod('GET');
                setPayload('');
                setHeaders('{}');
              }}
            >
              Health Check
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
