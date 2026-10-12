import socket
import ipaddress
from urllib.parse import urlparse

import requests
from flask import Flask, request


def create_app():
    # create and configure the app
    app = Flask(__name__)

    @app.post("/api/getstatus")
    def get_status():        
        print(request.remote_addr)
        data = request.get_json()
        request_url = data.get("requestUrl")
        url_ok = False
        private = True # local networks
        CGNAT_net = True # 100.64.0.0/10 block of IPv4 reserved for use in carrier-grade NAT scenarios.
        try:
            parsed_url = urlparse(request_url)
            print(parsed_url)
            hostname = parsed_url.hostname
            if hostname:
                print(hostname)
                ip = socket.gethostbyname(hostname)
                print(ip)
                ip_obj = ipaddress.ip_address(ip)
                private = ip_obj.is_private
                CGNAT_net = ip_obj in ipaddress.ip_network("100.64.0.0/10")
                print(private)
                url_ok = True
        except (TypeError, socket.gaierror, ValueError) as ex:
            print (ex)
        if url_ok:
            if not (private or CGNAT_net):
                try:
                    req = requests.head(request_url, timeout=10, allow_redirects=True)
                    return {"statusCode": req.status_code, "requestErr": ""}
                except requests.exceptions.ConnectTimeout as ex:
                    return {"statusCode": 408, "requestErr": "timeout"}
                except requests.exceptions.ConnectionError as ex:
                    return {"statusCode": 503, "requestErr": "connectionErr"}
                except requests.exceptions.MissingSchema as ex:
                    return {"statusCode": 400, "requestErr": "notValid"}
                except requests.exceptions.RequestException as ex:
                    return {"statusCode": 500, "requestErr": "internalErr"}
            else:
                return {"statusCode": 403, "requestErr": "privatAddres"}
        else:
            return {"statusCode": 400, "requestErr": "notValid"}
        
        
    @app.route("/api/getmyip")
    def get_my_ip():
        return {"myIp": request.remote_addr}

    return app