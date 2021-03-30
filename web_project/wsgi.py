"""
WSGI config for web_project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os
import sys
import site

site.addsitedir('home/djangoapps/.virtualenvs/corex/local/lib/python2.7/site-packages')

sys.path.append('/var/www/paccanarolab.org/apps/corex_2/web_project')
sys.path.append('/var/www/paccanarolab.org/apps/corex_2')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "web_project.settings")
activate_env = '/home/djangoapps/.virtualenvs/corex/bin/activate_this.py'
execfile(activate_env, dict(__file__=activate_env))

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
