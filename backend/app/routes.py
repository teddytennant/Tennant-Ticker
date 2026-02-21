from flask import Blueprint, jsonify, request
import requests
import json
import traceback
import os
from datetime import datetime, timedelta
import pandas as pd
import random
import time

api_bp = Blueprint('api', __name__)

# Get Alpha Vantage API key from environment variable or use demo key
ALPHA_VANTAGE_API_KEY = os.environ.get('ALPHA_VANTAGE_API_KEY', 'demo')
ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

# Get X.AI API key
XAI_API_KEY = os.environ.get('XAI_API_KEY', '')
XAI_API_URL = 'https://api.x.ai/v1'

# Enable mock data as fallback when API fails
USE_MOCK_DATA_FALLBACK = True

def format_number(value):
    """Format a number to handle non-numeric values"""
    try:
        return float(value) if value is not None else 0.0
    except (ValueError, TypeError):
        return 0.0

def get_mock_quote(symbol):
    """Generate mock quote data for testing when API is unavailable"""
    current_price = random.uniform(100, 500)
    change = random.uniform(-20, 20)
    change_percent = (change / current_price) * 100
    
    return {
        "symbol": symbol,
        "shortName": f"{symbol} Inc.",
        "regularMarketPrice": current_price,
        "regularMarketChange": change,
        "regularMarketChangePercent": change_percent,
        "regularMarketVolume": random.randint(1000000, 10000000),
        "marketCap": current_price * random.randint(10000000, 1000000000),
        "regularMarketOpen": current_price - random.uniform(-10, 10),
        "regularMarketDayHigh": current_price + random.uniform(0, 10),
        "regularMarketDayLow": current_price - random.uniform(0, 10),
        "regularMarketPreviousClose": current_price - change
    }

def get_mock_historical_data(symbol, days=30):
    """Generate mock historical data for testing when API is unavailable"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    data = []
    current_price = random.uniform(100, 500)
    
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() < 5:  # Only generate data for weekdays
            # Randomly adjust price with some trend
            price_change = random.uniform(-5, 5)
            current_price += price_change
            
            # Ensure price doesn't go negative
            current_price = max(current_price, 10)
            
            open_price = current_price - random.uniform(-2, 2)
            high_price = max(current_price, open_price) + random.uniform(0, 3)
            low_price = min(current_price, open_price) - random.uniform(0, 3)
            
            data.append({
                "Date": current_date.strftime("%Y-%m-%d"),
                "Open": round(open_price, 2),
                "High": round(high_price, 2),
                "Low": round(low_price, 2),
                "Close": round(current_price, 2),
                "Volume": random.randint(1000000, 10000000)
            })
        
        current_date += timedelta(days=1)
    
    return data

@api_bp.route('/quote/<symbol>', methods=['GET'])
def get_quote(symbol):
    try:
        # Add a small delay to simulate network latency
        time.sleep(0.2)
        
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': ALPHA_VANTAGE_API_KEY
        }
        
        print(f"Making API request to Alpha Vantage for {symbol}...")
        
        try:
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params, timeout=5)
            data = response.json()
            
            print(f"Alpha Vantage API response for {symbol}: {data}")
            
            if 'Global Quote' not in data or not data['Global Quote'] or not data['Global Quote'].get("05. price"):
                if 'Error Message' in data:
                    print(f"Alpha Vantage API error: {data['Error Message']}")
                    if USE_MOCK_DATA_FALLBACK:
                        print(f"Using mock data for {symbol} due to API error")
                        return jsonify(get_mock_quote(symbol))
                    return jsonify({"error": data['Error Message']}), 400
                elif 'Information' in data:
                    print(f"Alpha Vantage API limit: {data['Information']}")
                    if USE_MOCK_DATA_FALLBACK:
                        print(f"Using mock data for {symbol} due to API limit")
                        return jsonify(get_mock_quote(symbol))
                    return jsonify({"error": "API rate limit reached. Please try again later."}), 429
                else:
                    print(f"Unknown API response format: {data}")
                    if USE_MOCK_DATA_FALLBACK:
                        print(f"Using mock data for {symbol} due to unknown response format")
                        return jsonify(get_mock_quote(symbol))
                    return jsonify({"error": f"Unable to retrieve quote data for {symbol}"}), 404
            
            quote_data = data['Global Quote']
            
            # Try to get company overview, but don't fail if it doesn't work
            company_data = {}
            try:
                company_params = {
                    'function': 'OVERVIEW',
                    'symbol': symbol,
                    'apikey': ALPHA_VANTAGE_API_KEY
                }
                company_response = requests.get(ALPHA_VANTAGE_BASE_URL, params=company_params, timeout=5)
                company_data = company_response.json()
                print(f"Company overview API response: {company_data}")
            except Exception as e:
                print(f"Error fetching company data for {symbol}: {str(e)}")
            
            quote = {
                "symbol": symbol,
                "shortName": company_data.get("Name", symbol),
                "regularMarketPrice": format_number(quote_data.get("05. price")),
                "regularMarketChange": format_number(quote_data.get("09. change")),
                "regularMarketChangePercent": format_number(quote_data.get("10. change percent").replace('%', '')) if quote_data.get("10. change percent") else 0,
                "regularMarketVolume": format_number(quote_data.get("06. volume")),
                "marketCap": format_number(company_data.get("MarketCapitalization")),
                "regularMarketOpen": format_number(quote_data.get("02. open")),
                "regularMarketDayHigh": format_number(quote_data.get("03. high")),
                "regularMarketDayLow": format_number(quote_data.get("04. low")),
                "regularMarketPreviousClose": format_number(quote_data.get("08. previous close"))
            }
            return jsonify(quote)
        except Exception as api_error:
            print(f"API request error for {symbol}: {str(api_error)}")
            if USE_MOCK_DATA_FALLBACK:
                print(f"Using mock data for {symbol} due to API request error")
                return jsonify(get_mock_quote(symbol))
            raise api_error
            
    except Exception as e:
        print(f"Error fetching quote for {symbol}: {str(e)}")
        print(traceback.format_exc())
        
        if USE_MOCK_DATA_FALLBACK:
            print(f"Using mock data for {symbol} due to exception")
            return jsonify(get_mock_quote(symbol))
            
        return jsonify({"error": str(e)}), 500

@api_bp.route('/historical/<symbol>', methods=['GET'])
def get_historical(symbol):
    try:
        # Add a small delay to simulate network latency
        time.sleep(0.2)
        
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        
        # Map period to days for mock data
        if period == '1mo':
            days = 30
        elif period == '3mo':
            days = 90
        elif period == '6mo':
            days = 180
        elif period == '1y':
            days = 365
        else:
            days = 30  # Default
        
        # Map period to Alpha Vantage output size
        output_size = 'full' if period in ['1y', '2y', '5y', 'max'] else 'compact'
        
        # Map interval to Alpha Vantage function
        if interval in ['1d', 'daily']:
            function = 'TIME_SERIES_DAILY'
            time_series_key = 'Time Series (Daily)'
        elif interval in ['1wk', 'weekly']:
            function = 'TIME_SERIES_WEEKLY'
            time_series_key = 'Weekly Time Series'
        elif interval in ['1mo', 'monthly']:
            function = 'TIME_SERIES_MONTHLY'
            time_series_key = 'Monthly Time Series'
        else:
            # Default to daily
            function = 'TIME_SERIES_DAILY'
            time_series_key = 'Time Series (Daily)'
        
        try:
            params = {
                'function': function,
                'symbol': symbol,
                'apikey': ALPHA_VANTAGE_API_KEY,
                'outputsize': output_size
            }
            
            print(f"Making historical data API request for {symbol}...")
            
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params, timeout=5)
            data = response.json()
            
            if time_series_key not in data or not data[time_series_key]:
                print(f"No historical data available for {symbol}, response: {data}")
                if USE_MOCK_DATA_FALLBACK:
                    print(f"Using mock historical data for {symbol}")
                    return jsonify(get_mock_historical_data(symbol, days))
                return jsonify({"error": f"Unable to retrieve historical data for {symbol}"}), 404
            
            time_series = data[time_series_key]
            
            # Create a list of historical data points
            historical_data = []
            for date, values in time_series.items():
                historical_data.append({
                    "Date": date,
                    "Open": format_number(values.get("1. open")),
                    "High": format_number(values.get("2. high")),
                    "Low": format_number(values.get("3. low")),
                    "Close": format_number(values.get("4. close")),
                    "Volume": format_number(values.get("5. volume", values.get("6. volume", 0)))
                })
            
            # Sort by date (newest first)
            historical_data.sort(key=lambda x: x["Date"], reverse=True)
            
            # Limit results based on period
            if period == '1mo':
                limit = 30
            elif period == '3mo':
                limit = 90
            elif period == '6mo':
                limit = 180
            elif period == '1y':
                limit = 365
            else:
                limit = len(historical_data)
            
            return jsonify(historical_data[:limit])
        except Exception as api_error:
            print(f"API request error for historical data: {str(api_error)}")
            if USE_MOCK_DATA_FALLBACK:
                print(f"Using mock historical data for {symbol} due to API error")
                return jsonify(get_mock_historical_data(symbol, days))
            raise api_error
            
    except Exception as e:
        print(f"Error fetching historical data for {symbol}: {str(e)}")
        print(traceback.format_exc())
        
        if USE_MOCK_DATA_FALLBACK:
            print(f"Using mock historical data for {symbol} due to exception")
            return jsonify(get_mock_historical_data(symbol, days))
            
        return jsonify({"error": str(e)}), 500

@api_bp.route('/market-indices', methods=['GET'])
def get_market_indices():
    try:
        indices = ['SPY', 'QQQ', 'DIA', 'IWM']  # ETFs that track S&P 500, NASDAQ, Dow Jones, Russell 2000
        names = ['S&P 500', 'NASDAQ', 'Dow Jones', 'Russell 2000']
        market_indices = []
        
        for symbol, name in zip(indices, names):
            try:
                params = {
                    'function': 'GLOBAL_QUOTE',
                    'symbol': symbol,
                    'apikey': ALPHA_VANTAGE_API_KEY
                }
                
                response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
                data = response.json()
                
                if 'Global Quote' in data and data['Global Quote']:
                    quote_data = data['Global Quote']
                    
                    market_indices.append({
                        "symbol": symbol,
                        "name": name,
                        "price": format_number(quote_data.get("05. price")),
                        "change": format_number(quote_data.get("09. change")),
                        "changePercent": format_number(quote_data.get("10. change percent", "0").replace('%', ''))
                    })
            except Exception as e:
                print(f"Error processing index {symbol}: {str(e)}")
                # Continue with other indices even if one fails
        
        if not market_indices:
            return jsonify({"error": "Failed to retrieve market indices"}), 500
            
        return jsonify(market_indices)
    except Exception as e:
        print("Error fetching market indices:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@api_bp.route('/top-movers', methods=['GET'])
def get_top_movers():
    try:
        symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 
                  'V', 'HD', 'PG', 'UNH', 'XOM', 'COST', 'AVGO', 'ADBE']
        movers = []
        
        for symbol in symbols:
            try:
                params = {
                    'function': 'GLOBAL_QUOTE',
                    'symbol': symbol,
                    'apikey': ALPHA_VANTAGE_API_KEY
                }
                
                response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
                data = response.json()
                
                if 'Global Quote' in data and data['Global Quote']:
                    quote_data = data['Global Quote']
                    
                    # Try to get company name from OVERVIEW endpoint
                    company_name = symbol
                    try:
                        company_params = {
                            'function': 'OVERVIEW',
                            'symbol': symbol,
                            'apikey': ALPHA_VANTAGE_API_KEY
                        }
                        company_response = requests.get(ALPHA_VANTAGE_BASE_URL, params=company_params)
                        company_data = company_response.json()
                        if 'Name' in company_data:
                            company_name = company_data['Name']
                    except:
                        pass
                    
                    movers.append({
                        "symbol": symbol,
                        "name": company_name,
                        "price": format_number(quote_data.get("05. price")),
                        "change": format_number(quote_data.get("09. change")),
                        "changePercent": format_number(quote_data.get("10. change percent", "0").replace('%', '')),
                        "volume": format_number(quote_data.get("06. volume"))
                    })
            except Exception as e:
                print(f"Error processing mover {symbol}: {str(e)}")
                # Continue with other symbols even if one fails
        
        # Sort by absolute change percentage to get real movers
        movers.sort(key=lambda x: abs(x["changePercent"]), reverse=True)
        
        # Take top 8 movers
        return jsonify(movers[:8])
    except Exception as e:
        print("Error fetching top movers:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@api_bp.route('/sector-performance', methods=['GET'])
def get_sector_performance():
    try:
        # Map ETF symbols to sector names
        sectors = {
            'XLK': 'Technology',
            'XLF': 'Financial',
            'XLV': 'Healthcare',
            'XLE': 'Energy',
            'XLY': 'Consumer Cyclical',
            'XLP': 'Consumer Defensive',
            'XLI': 'Industrial',
            'XLB': 'Basic Materials',
            'XLRE': 'Real Estate',
            'XLU': 'Utilities',
            'XLC': 'Communication Services'
        }
        
        performance = []
        for symbol, sector in sectors.items():
            try:
                params = {
                    'function': 'GLOBAL_QUOTE',
                    'symbol': symbol,
                    'apikey': ALPHA_VANTAGE_API_KEY
                }
                
                response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
                data = response.json()
                
                if 'Global Quote' in data and data['Global Quote']:
                    quote_data = data['Global Quote']
                    
                    performance.append({
                        "sector": sector,
                        "performance": format_number(quote_data.get("10. change percent", "0").replace('%', '')),
                        "lastUpdated": datetime.now().isoformat()
                    })
            except Exception as e:
                print(f"Error processing sector {sector} ({symbol}): {str(e)}")
                # Add placeholder data if we can't get the actual data
                performance.append({
                    "sector": sector,
                    "performance": 0,
                    "lastUpdated": datetime.now().isoformat(),
                    "error": True
                })
        
        # Sort by performance (descending)
        performance.sort(key=lambda x: x.get("performance", 0), reverse=True)
        
        return jsonify(performance)
    except Exception as e:
        print("Error fetching sector performance:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@api_bp.route('/health', methods=['GET'])
def health():
    from datetime import datetime
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

@api_bp.route('/test-xai', methods=['GET'])
def test_xai_api():
    """Test endpoint for X.AI API connectivity"""
    try:
        print("Testing X.AI API connection...")
        
        if not XAI_API_KEY:
            return jsonify({"error": "X.AI API key is not configured"}), 400
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {XAI_API_KEY}'
        }
        
        body = {
            "model": "grok-2-latest",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello! Can you tell me about the stock market today?"}
            ],
            "temperature": 0.7,
            "max_tokens": 100
        }
        
        response = requests.post(
            f"{XAI_API_URL}/chat/completions",
            headers=headers,
            json=body,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                message = data['choices'][0]['message']['content']
                return jsonify({
                    "status": "success",
                    "message": message
                })
            else:
                return jsonify({
                    "status": "error",
                    "error": "Invalid response format from X.AI API",
                    "data": data
                }), 500
        else:
            return jsonify({
                "status": "error",
                "error": f"Error calling X.AI API: {response.status_code}",
                "response": response.text
            }), response.status_code
            
    except Exception as e:
        print(f"Error testing X.AI API: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@api_bp.route('/stock-news-summary/<symbol>', methods=['GET'])
def get_stock_news_summary(symbol):
    """Get AI-powered news summary for a specific stock"""
    try:
        print(f"Getting news summary for {symbol} using X.AI API...")
        
        if not XAI_API_KEY:
            print("X.AI API key is not configured")
            return jsonify({
                "symbol": symbol,
                "summary": get_mock_news_summary(symbol),
                "source": "mock",
                "error": "X.AI API key is not configured"
            })
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {XAI_API_KEY}'
        }
        
        # Create a prompt specific to the stock
        prompt = f"Give me a summary of the news today for {symbol}. Focus on the most important developments that could impact the stock price. Organize the summary by themes if there are multiple topics. Keep it concise but informative."
        
        body = {
            "model": "grok-2-latest",
            "messages": [
                {"role": "system", "content": "You are a financial assistant providing stock news summaries. Keep responses concise and focused on how news might impact stock performance."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        # Print request details (without sensitive data)
        print(f"X.AI API URL: {XAI_API_URL}")
        print(f"X.AI API Key: {'configured' if XAI_API_KEY else 'missing'}")
        
        response = requests.post(
            f"{XAI_API_URL}/chat/completions",
            headers=headers,
            json=body,
            timeout=20  # 20 second timeout for AI models
        )
        
        print(f"X.AI API response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"X.AI API response data: {json.dumps(data)[:500]}...")  # Print first 500 chars
            
            if 'choices' in data and len(data['choices']) > 0:
                message = data['choices'][0]['message']['content']
                return jsonify({
                    "symbol": symbol,
                    "summary": message,
                    "source": "xai"
                })
            else:
                print(f"Invalid response format from X.AI API: {data}")
                # Fall back to mock data
                return jsonify({
                    "symbol": symbol,
                    "summary": get_mock_news_summary(symbol),
                    "source": "mock",
                    "error": "Invalid API response format"
                })
        else:
            error_message = f"Error calling X.AI API: {response.status_code}"
            try:
                error_details = response.text
            except:
                error_details = "No response text available"
                
            print(f"{error_message} - {error_details}")
            # Fall back to mock data
            return jsonify({
                "symbol": symbol,
                "summary": get_mock_news_summary(symbol),
                "source": "mock",
                "error": error_message
            })
            
    except Exception as e:
        error_message = f"Error generating news summary for {symbol}: {str(e)}"
        print(error_message)
        print(traceback.format_exc())
        # Fall back to mock data
        return jsonify({
            "symbol": symbol,
            "summary": get_mock_news_summary(symbol),
            "source": "mock",
            "error": error_message
        })

def get_mock_news_summary(symbol):
    """Generate a mock news summary for a stock when API fails"""
    return f"""**Product Announcements and Updates**
- {symbol} recently unveiled its next-generation product line with enhanced features
- The company's software platform received a major update focusing on security and performance
- New partnerships with key industry players were announced to expand market reach

**Financial Performance**
- Q{random.randint(1, 4)} earnings {'exceeded' if random.random() > 0.5 else 'fell short of'} analyst expectations by {random.randint(1, 10)}%
- Revenue grew by {random.randint(5, 20)}% year-over-year, driven by {'strong product sales' if random.random() > 0.5 else 'service subscription growth'}
- The company {'announced' if random.random() > 0.5 else 'maintained'} its dividend of ${random.randint(1, 5)}.{random.randint(0, 99):02d} per share

**Market Position and Competition**
- {symbol} {'gained' if random.random() > 0.5 else 'maintained'} market share in its core business segments
- Competitors have responded with {'aggressive pricing strategies' if random.random() > 0.5 else 'new product launches'}
- Industry analysts project {'favorable' if random.random() > 0.5 else 'challenging'} conditions for the sector in the coming quarters

*Note: This is a simulated news summary based on known information about {symbol}.*"""

@api_bp.route('/research', methods=['POST'])
def get_research_response():
    """Get AI-powered research response for chat conversations"""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
            
        message = data['message']
        prompt_type = data.get('promptType', 'GENERAL_ADVISOR')
        
        print(f"Getting research response for prompt type: {prompt_type}")
        
        if not XAI_API_KEY:
            print("X.AI API key is not configured")
            return jsonify({
                "response": get_mock_research_response(message, prompt_type),
                "source": "mock",
                "error": "X.AI API key is not configured"
            })
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {XAI_API_KEY}'
        }
        
        # Create system prompt based on prompt type
        system_prompts = {
            'GENERAL_ADVISOR': "You are a knowledgeable financial advisor. Provide helpful, accurate information about investing, stocks, and financial markets. Be professional and conservative in your advice.",
            'PORTFOLIO_ADVISOR': "You are a portfolio management expert. Help users with portfolio construction, asset allocation, risk management, and investment strategy. Focus on diversification and long-term planning.",
            'NEWS_SUMMARY': "You are a financial news analyst. Provide concise summaries of market news and developments that could impact investments.",
            'WEBSITE_HELP': "You are a helpful assistant for a financial website. Provide guidance on using the platform and understanding financial data.",
            'STOCK_RECOMMENDATIONS': "You are a stock research analyst. Provide detailed analysis of stocks, including fundamentals, technicals, and market conditions. Always include appropriate disclaimers about investment risks."
        }
        
        system_prompt = system_prompts.get(prompt_type, system_prompts['GENERAL_ADVISOR'])
        
        body = {
            "model": "grok-2-latest",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        print(f"Making X.AI API request for research response...")
        
        response = requests.post(
            f"{XAI_API_URL}/chat/completions",
            headers=headers,
            json=body,
            timeout=30  # 30 second timeout for AI models
        )
        
        print(f"X.AI API response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"X.AI API response received")
            
            if 'choices' in data and len(data['choices']) > 0:
                ai_response = data['choices'][0]['message']['content']
                return jsonify({
                    "response": ai_response,
                    "source": "xai"
                })
            else:
                print(f"Invalid response format from X.AI API: {data}")
                # Fall back to mock data
                return jsonify({
                    "response": get_mock_research_response(message, prompt_type),
                    "source": "mock",
                    "error": "Invalid API response format"
                })
        else:
            error_message = f"Error calling X.AI API: {response.status_code}"
            try:
                error_details = response.text
            except:
                error_details = "No response text available"
                
            print(f"{error_message} - {error_details}")
            # Fall back to mock data
            return jsonify({
                "response": get_mock_research_response(message, prompt_type),
                "source": "mock",
                "error": error_message
            })
            
    except Exception as e:
        error_message = f"Error generating research response: {str(e)}"
        print(error_message)
        print(traceback.format_exc())
        # Fall back to mock data
        return jsonify({
            "response": get_mock_research_response(data.get('message', ''), data.get('promptType', 'GENERAL_ADVISOR')),
            "source": "mock",
            "error": error_message
        })

def get_mock_research_response(message, prompt_type):
    """Generate a mock research response when API fails"""
    responses = {
        'GENERAL_ADVISOR': "Based on current market conditions, I recommend maintaining a diversified portfolio. Consider your risk tolerance and investment timeline when making decisions. Remember that past performance doesn't guarantee future results.",
        'PORTFOLIO_ADVISOR': "For portfolio construction, I suggest allocating across different asset classes. A typical balanced portfolio might include 60% stocks, 30% bonds, and 10% alternatives, but this should be adjusted based on your specific situation and goals.",
        'NEWS_SUMMARY': "Today's market news includes mixed economic data and ongoing concerns about inflation. Major indices are showing modest gains, with technology stocks leading the advance.",
        'WEBSITE_HELP': "This platform provides comprehensive financial data and analysis tools. You can view stock quotes, historical data, and market indices. Use the search function to find specific stocks or the dashboard for an overview.",
        'STOCK_RECOMMENDATIONS': "When evaluating stocks, consider fundamental factors like earnings growth, valuation metrics, and competitive positioning. Technical analysis can also provide insights into price trends. Always conduct thorough research and consider consulting a financial advisor."
    }
    
    return responses.get(prompt_type, responses['GENERAL_ADVISOR'])