from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import argparse
import logging
import warnings
import csv 
import pandas as pd
import unicodedata

from rasa_core.policies.fallback import FallbackPolicy
from rasa_core.policies.keras_policy import KerasPolicy
from rasa_core import utils
from rasa_core.actions import Action
from rasa_core.actions.forms import FormAction
from rasa_core.agent import Agent
from rasa_core.channels.console import ConsoleInputChannel
from rasa_core.events import SlotSet
from rasa_core.events import AllSlotsReset
from rasa_core.featurizers import (
    MaxHistoryTrackerFeaturizer,
    BinarySingleStateFeaturizer)
from rasa_core.interpreter import RasaNLUInterpreter
from rasa_core.policies.memoization import MemoizationPolicy
from rasa_nlu.model import Metadata, Interpreter
from rasa_core.trackers import DialogueStateTracker

logger = logging.getLogger(__name__)


class RestaurantAPI(object):
    def search(self, info):
        return "papi's pizza place"


class ActionSearchRestaurants(Action):
    def name(self):
        return 'action_search_restaurants'

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message("looking for restaurants")
        restaurant_api = RestaurantAPI()
        restaurants = restaurant_api.search(tracker.get_slot("cuisine"))
        return [SlotSet("matches", restaurants)]


class ActionSearchName(FormAction):
#    RANDOMIZE = False

#    @staticmethod
#    def required_field():
#	return [
#		EntityFormField("location", "location")
#	]

    def name(self):
        return 'action_search_name'

    def run(self, dispatcher, tracker, domain):
	
	name = tracker.get_slot("r_name")
	if name is None:
		name = '^""$'

	location = tracker.get_slot("location")
	if location is None:
		location = '^""$'

	df = pd.read_csv("yelp_business.csv")
	result = df.loc[(df['name'].str.contains(name, case = False)) | (df['city'].str.contains(location, case = False)), df.notnull().any(axis = 0)]
	if result.empty:
		dispatcher.utter_message("Restaurant address Unavailable :(")
		y = None
	else:
		dispatcher.utter_message("Here's what I found:")
		y = result["address"].reset_index(drop=True)
		name = None
		location = None
	if y is not None:
		dispatcher.utter_message("Address :")
		dispatcher.utter_message(y[0])
	
	return [AllSlotsReset()]

class ActionCheckRestaurants(Action):

    def name(self):
        return 'action_check_restaurants'

    def run(self, dispatcher, tracker, domain):
	
	cuisine1 = tracker.get_slot("cuisine")
	food = tracker.get_slot("food")
	location = tracker.get_slot("location")

	if cuisine1 is None:
		cuisine1 = '^""$'
	if food is None:
		food = '^""$'
	#if else for location
	if location is None:
		dispatcher.utter_message("Kindly enter the location")
	else:
		dispatcher.utter_message("Here's what I found:")
		df = pd.read_csv("yelp_business.csv")
		result = df.loc[(df['categories'].str.contains(food, case = False)) | (df['categories'].str.contains(cuisine1, case = False))| (df['city'].str.contains(location, case = False)), df.notnull().any(axis = 0)]
			
		if result.empty:
			dispatcher.utter_message("No results available")
		else:
			dispatcher.utter_message("-----------------------------------")	

			y = result["name"].reset_index(drop=True)
			y1 = result["address"].reset_index(drop=True)
			y2 = result["categories"].reset_index(drop=True)
			#y3 = result["city"].reset_index(drop=True)

			for i in range(2):
				dispatcher.utter_message("Name:")
				if y[i] is None:
					y[i] = "Not available"
					dispatcher.utter_message(y[i])
				else:
					dispatcher.utter_message(y[i])

				dispatcher.utter_message("Address:")
				if y1[i] is None:
					y1[i] = "Not available"
					dispatcher.utter_message(y1[i])
				else:
					dispatcher.utter_message(y1[i])
					#dispatcher.utter_message("City:")

				#if y3[i] is None:
				#	dispatcher.utter_message(y3[i])
				#else:
				#	dispatcher.utter_message(y3[i])
			
			#dispatcher.utter_message("Here is what else you can get there:")
			#if y2[i] is None:
			#	y2[i] = 'Not available'
			#x = y2[i].split(';')
			#for z in x:
			#	dispatcher.utter_message(z)

				dispatcher.utter_message("----------------")
			dispatcher.utter_message("--------------------------------------")
			
			
			return_slots = []
			for slot in tracker.slots:
				return_slots.append(SlotSet(slot, None))
			return return_slots

	return []


class ActionGreetInfo(Action):

    def name(self):
        return 'action_greet_info'

    def run(self, dispatcher, tracker, domain):
	dispatcher.utter_message("-We can help you finding your desired cuisines")
	dispatcher.utter_message("-Your desired dishes")
	dispatcher.utter_message("-In any specified location")
	dispatcher.utter_message("-Address of a particular restaurant")
        return []
	

def train_dialogue(domain_file="restaurant_domain.yml",
                   model_path="models/dialogue",
                   training_data_file="data/babi_stories.md"):
    fallback = FallbackPolicy(fallback_action_name="action_default_fallback",
                          core_threshold=0.3,
                          nlu_threshold=0.3)
    agent = Agent(domain_file, policies = [MemoizationPolicy(), KerasPolicy()])

    #training_data = agent.load_data(training_data_file)
    agent.train(
            training_data_file,
            epochs=400,
            batch_size=100,
            validation_split=0.2
    )

    agent.persist(model_path)
    return agent

def train_nlu():
    from rasa_nlu.training_data import load_data
    from rasa_nlu import config
    from rasa_nlu.model import Trainer

    training_data = load_data('data/data')
    trainer = Trainer(config.load("nlu_model_config.yml"))
    trainer.train(training_data)
    model_directory = trainer.persist('models/nlu/',
                                      fixed_model_name="current")

    return model_directory


def run_nlu():
	interpreter = Interpreter.load('./models/nlu/default/current')
	x = interpreter.parse("are there any vegetarian restaurants")
	print(x)


def run(serve_forever=True):
    interpreter = RasaNLUInterpreter("models/nlu/default/current")
    agent = Agent.load("models/dialogue", interpreter=Interpreter)

    if serve_forever:
        agent.handle_channel(ConsoleInputChannel())
    return agent



if __name__ == '__main__':
    utils.configure_colored_logging(loglevel="INFO")

    parser = argparse.ArgumentParser(
            description='starts the bot')

    parser.add_argument(
            'task',
            choices=["train-nlu", "train-dialogue", "run","run-nlu"],
            help="what the bot should do - e.g. run or train?")
    task = parser.parse_args().task

    # decide what to do based on first parameter of the script
    if task == "train-nlu":
        train_nlu()
    elif task == "train-dialogue":
        train_dialogue()
    elif task == "run":
        run()
    elif task == "run-nlu":
	run_nlu()
