import http.server
import socketserver
import os
import sys

def start_server(port=8000):
    try:
        # Change to the directory containing the HTML files
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Create the server
        Handler = http.server.SimpleHTTPRequestHandler
        with socketserver.TCPServer(("", port), Handler) as httpd:
            print(f"\nServer started successfully!")
            print(f"Open your web browser and go to: http://localhost:{port}")
            print("Press Ctrl+C to stop the server...\n")
            httpd.serve_forever()
            
    except PermissionError:
        print("\nError: Permission denied. Try running with administrator privileges.")
        input("Press Enter to exit...")
        sys.exit(1)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\nError: Port {port} is already in use.")
            print("Try closing other applications that might be using this port.")
            input("Press Enter to exit...")
            sys.exit(1)
        else:
            print(f"\nError: {e}")
            input("Press Enter to exit...")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        input("Press Enter to exit...")
        sys.exit(1)

if __name__ == "__main__":
    start_server() 