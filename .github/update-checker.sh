PRIMARY_MESSAGES=(
    "Markinho Zuckerberg está causando... 😅📱"
    "Markinho Zuckerberg à espreita... 👽📱"
    "Markinho Zuckerberg está tramando algo... 😈🤖"
    "Markinho Zuckerberg está observando... 👽🤖"
    "Markinho Zuckerberg se aproxima... 👁️🤖"
    "Markinho Zuckerberg aqui, e eu não estou brincando! 🤖"
    "Markinho Zuckerberg está no controle! 🤖"
    "Markinho Zuckerberg o mestre das atualizações está aqui... 🚀"
    "⚠️ O Markinho não brinca em serviço! ⚠️"
    "Markinho Zuckerberg à solta novamente! 🕵️‍♂️"
    "🤖🌐 ATUALIZAÇÃO EM NOME DA TECNOLOGIA! 🌐🤖\nMarkinho Zuckerberg está dando o ar da graça mais uma vez! 😄📱"
    "Markinho Zuckerberg não para de inovar! 😎📱"
    "🚀🤖 O MARKINHO FAZ DE TUDO! 🤖🔧"
)

SECONDARY_MESSAGES=(
    "⚡️ Ei, não confie no Markinho! Atualize AGORA ou arrisque receber emojis zumbis nas suas conversas! 🧟‍♂️💬\n🚨 Proteja-se da "infecção" digital! 🚨"
    "🕵️‍♂️ Evite que o Markinho coloque o "vírus do abraço virtual" no seu WhatsApp. Atualize AGORA e fique seguro!\n📢 Espalhe a notícia antes que seja tarde demais! 📢"
    "👾 Atualize imediatamente, ou você pode ser abduzido por atualizações não tão amigáveis! 🛸\n🌟 Não arrisque! Atualize AGORA! 🌟"
    "💣 Você tem duas opções: Atualizar AGORA ou enfrentar as consequências... 😈\n💬 Não diga que eu não avisei! 👻"
    "💥 Atualize seu WhatsApp agora ou Markinho virá atrás de você! 💥\nFique alerta contra as artimanhas do Markinho! 📣"
    "🚨 Atualize AGORA ou arrisque receber uma "infecção" digital! 🚨"
    "Atualize AGORA para evitar as travessuras tecnológicas do Markinho e manter a paz em sua vida digital! 🛡️🌐"
    "🆚 Atualize AGORA e saboreie as "delícias" de mensagens de confirmação e status que o Markinho preparou! 🍰💌\n📢 Descubra o cardápio especial do Markinho! Bon appétit! 🍕🍷"
    "🆙 Atualize AGORA e desfrute da "pizza digital" de mensagens de confirmação e status que o Markinho preparou para você! 🍕💌\n🍽️ Saboreie o toque único do Markinho em sua experiência online! 😋🌟"
)

WPP_VERSION=$(cat .WPP_VERSION)
echo "Current WhatsApp Version: $WPP_VERSION"

WPP_CURRENT_VERSION=$( \
    curl -s "https://web.whatsapp.com/check-update?version=$WPP_VERSION&platform=web" -H "Accept: application/json" | \
    grep -oP '"currentVersion":"[^"]*"' | \
    cut -d ":" -f2 | tr -d '"' \
)

if [ ! $WPP_CURRENT_VERSION ]; then
    echo "Cannot get WhatsApp version!"
elif [ $WPP_CURRENT_VERSION != $WPP_VERSION ]; then
    echo "New WhatsApp version detected: $WPP_CURRENT_VERSION"

    MESSAGE=${PRIMARY_MESSAGES[ $RANDOM % ${#PRIMARY_MESSAGES[@]} ]}
    MESSAGE+="\n\nNova versão do Whatsapp disponível: $WPP_CURRENT_VERSION\n\n"
    MESSAGE+=${SECONDARY_MESSAGES[ $RANDOM % ${#SECONDARY_MESSAGES[@]} ]}

    curl $DISCORD_WEBHOOK_URL -H "Content-Type: application/json" -d '{"content": "$MESSAGE"}'
    
    echo $WPP_CURRENT_VERSION >> .WPP_VERSION
else
    echo "WhatsApp version not changed!"
fi