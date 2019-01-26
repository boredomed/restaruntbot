## path1
* greet
  - utter_greet
  - action_greet_info
* restaurant_search{"r_name" : "macdonld"}
  - utter_ask_location
* restaurant_search{"location": "toronto"}
  - action_search_name
  - utter_further_info
* restaurant_search{"r_name" : "macdonld"}
  - utter_ask_location
* restaurant_search{"location": "toronto"}
  - action_search_name
* affirm
  - utter_affirm
* goodbye
  - utter_bye

## path2
* restaurant_search{"food" : "burgers"}
  - utter_ask_location
* restaurant_search{"location": "toronto"}
  - action_check_restaurants
  - utter_further_info
* restaurant_search{"food" : "burgers"}
  - utter_ask_location
* restaurant_search{"location": "toronto"}
  - action_check_restaurants

## path3
* restaurant_search{"food" : "burgers", "location": "toronto"}
  - action_check_restaurants
  - utter_further_info
* restaurant_search{"food" : "chinese", "location": "toronto"}
  - action_check_restaurants
  - utter_further_info

##path4
* restaurant_search{"location": "toronto","r_name" : "macdonld"}
  - action_search_name
  - utter_further_info

##path5
* greet
  - utter_greet
  - action_greet_info
* restaurant_search{"food" : "burgers"}
  - utter_ask_location
* restaurant_search{"location": "toronto"}
  - action_check_restaurants
  - utter_further_info
* affirm
  - utter_affirm
* goodbye
  - utter_bye


##path6
* restaurant_search{"cuisine" : "pakistani"}
  - utter_ask_location
* restaurant_search{"location": "toronto"}
  - action_check_restaurants
  - utter_further_info
* restaurant_search{"cuisine" : "chinese"}
  - utter_ask_location
* restaurant_search{"location": "toronto"}
  - action_check_restaurants

##path7
* goodbye
  - utter_bye
* goodbye
  - utter_bye
* greet
  - utter_greet
* greet
  - utter_greet

##path8
* restaurant_search{"r_name" : "kfc", "location": "toronto"}
  - action_search_name
  - utter_further_info

##path9
* restaurant_search{"location": "toronto"}
  - utter_after_loc
* restaurant_search{"cuisine" : "pakistani"}
  - action_check_restaurants
  - utter_further_info

##path10
* restaurant_search{"location": "toronto"}
  - utter_after_loc
* restaurant_search{"cuisine" : "pakistani"}
  - action_check_restaurants
  - utter_further_info
* restaurant_search{"location": "toronto"}
  - utter_after_loc
* restaurant_search{"cuisine" : "pakistani"}
  - action_check_restaurants

