# -*- coding: utf-8 -*-
{
    'name' : 'Custom Dahboard',
    'version' : '1.0',
    'sequence': -1,
    'description': """Custom Dashboard""",
    'category': 'OWL',
    'depends' : ['base', 'web', 'sale', 'board'],
    'data': [
        'views/custom_dahboard.xml',
    ],
    'demo': [
    ],
    'installable': True,
    'application': True,
    'assets': {
        'web.assets_backend': [
            'custom_dashboard/static/src/components/**/*.js',
            'custom_dashboard/static/src/components/**/*.xml',
            'custom_dashboard/static/src/components/**/*.scss',
        ],
    },
}
