/* Cookie Consent – TermsFeed integration */
document.addEventListener('DOMContentLoaded', function () {
    cookieconsent.run({
        "notice_banner_type": "headline",
        "consent_type": "express",
        "palette": "dark",
        "language": "de",
        "page_load_consent_levels": ["strictly-necessary"],
        "notice_banner_reject_button_hide": false,
        "preferences_center_close_button_hide": false,
        "page_refresh_confirmation_buttons": false,
        "website_name": "oz-calisthenics.at",
        "website_privacy_policy_url": "https://oz-calisthenics.at/datenschutz.html",
        "callbacks": {
            "scripts_specific_loaded": (level) => {
                switch(level) {
                    case 'tracking':
                        gtag('consent', 'update', {
                            'analytics_storage': 'granted'
                        });
                        break;
                    case 'targeting':
                        gtag('consent', 'update', {
                            'ad_storage': 'granted',
                            'ad_user_data': 'granted',
                            'ad_personalization': 'granted',
                            'analytics_storage': 'granted'
                        });
                        break;
                }
            }
        },
        "callbacks_force": true
    });
});
