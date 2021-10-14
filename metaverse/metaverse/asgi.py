"""
ASGI config for metaverse project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import zooming.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'metaverse.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # Just HTTP for now. (We can add other protocols later.)
    'websocket' : AuthMiddlewareStack(
        URLRouter(
            zooming.routing.websocket_urlpatterns
        )
    )
})