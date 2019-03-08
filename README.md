# Restaurant Search bot

It's an interactive restaurant search bot build on rasa using Rasa core and Rasa Nlu.</br>
https://rasa.com/

### Getting started

The dataset used in this bot is a restaurant dataset obtained from kaggle. It has allready been added in the repository.</br>

Functionalities added:</br>
User can make any open end queery based on</br>

1-The type of restaurant they want to find eg chineese, italian etc</br>
2-The food they want to get eg pizza, eggs etc</br>
3-Or the address of some particular restaurant.</br>

Users can ask complex question like telling all the details in a single response or ask them separately in any pattern the bot will work perfectly.</br>

## Sample conversations

### Chat 1</br>
**User**: Hello</br>
**Bot** : Hy there how I can help you finding the rite restaurant?
              -I can help you finding your desired cuisines</br>
              -Your desired dishes</br>
              -In any specified location</br>
              -Address of a particular restaurant</br>
**User**: Suggest some restaurants with good beef burgers</br>
**Bot** : Can you tell your current City?</br>
**User**: I am in las vegas</br>
**Bot** : Here is what i found</br>
Name:</br>
"BDJ Realty"</br>
Address:</br>
"2620 Regatta Dr, Ste 102"</br>
Kindly specify details if you want to search for some other restaurants</br>
**User**: Now can you show me some pizza parlors in torronto</br>
**Bot** :</br>
Name:</br>
"Little Caesars Pizza"</br>
Address:</br>
"10720 E Southern Ave"</br>
**User**: Tell me the address of nearby macdonald!</br>
**Bot**: </br>
Here's what I found:</br>
Address :</br>
"26540 N Scottsdale Rd"</br>
