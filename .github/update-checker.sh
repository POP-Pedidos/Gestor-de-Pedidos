echo "Current WhatsApp Version: $WPP_VERSION"

WPP_CURRENT_VERSION=$( \
    curl "https://web.whatsapp.com/check-update?version=$WPP_VERSION&platform=web" -H "Accept: application/json" | \
    grep -oP '"currentVersion":"[^"]*"' | \
    cut -d ":" -f2 | tr -d '"' \
)

if [ ! $WPP_CURRENT_VERSION ]; then
    echo "Cannot get WhatsApp version!"
elif [ $WPP_CURRENT_VERSION = $WPP_VERSION ]; then
    echo "New WhatsApp version detected: $WPP_CURRENT_VERSION"

    # MESSAGE=""

    # curl $DISCORD_WEBHOOK_URL -H "Content-Type: application/json" -d '{"content": "$MESSAGE"}'

    echo $WPP_CURRENT_VERSION >> $vars:WPP_VERSION
else
    echo "WhatsApp version not changed!"
fi