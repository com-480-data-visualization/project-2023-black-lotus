
# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
|Lazar Radojevic |351750 |
|Andrija Jelenkovic |352089 |
|Aleksa Milisavljevic |353621 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (7th April, 5pm)


### Dataset

We will be visualizing the NTSB aviation accident database from the [Kaggle](https://www.kaggle.com/datasets/khsamaha/aviation-accident-database-synopses?select=AviationData.csv). As stated there, "it contains information from 1962 and later about civil aviation accidents and selected incidents within the United States, its territories and possessions, and in international waters".

NTSB is an acronym for the National Transportation Safety Board, a federal agency in the United States that is responsible for investigating civil transportation accidents. They aim to uncover the cause of incidents and accidents and issue safety recommendations to prevent them from happening again. As of 2014, they have issued as many as 14,000 safety recommendations. This database, therefore, provides one of the most relevant sources of information for anyone aspiring to delve into the topic of aviation accidents.



### Problematic

Our main goal is to create an interactive map that allows users to explore the location and causes of aviation accidents in the United States and around the world.

#### Motivation

Statistical data is often presented tediously, encumbered with details that prevent any real understanding of the topic. Our goal is to present the raw information extracted from the NTSB dataset in an interesting and meaningful way, one that could inform people about the history of aviation and its evolution throughout the previous 50 years. For example, by plotting the number of accidents per year, one could visually observe the improvement in airplane safety. This fact is often overlooked by the media chasing the big headline after a major tragedy occurs.

#### Overview

By analyzing this dataset and mapping out the location and frequency of accidents over time, we aim to show the safety trends in the aviation industry. The interactive map will help us to visualize these trends in the way that is the most accessible to the general public. Alongside them, the project would encompass relevant information about some of the most impactful airplane accidents.

#### Target audience

This project aims to sparkle interest in the history of aviation crashes among the members of the general public. Besides them, this project could also prove useful for aviation safety experts, educators, researchers, policymakers, and anyone else who wants to find out more about the topic.


### Exploratory Data Analysis

You can see deails of data analysis we did in the notebook titled `src/data_exploration.ipynb`. Within this notebook, we have provided a detailed analysis of the aviation accident dataset, including several visualizations. One of these visualizations demonstrates that the number of plane crashes has decreased over time, suggesting an improvement in aviation safety.

![crashes-per-year](./data/images/crashes-per-year.png)

Additionally, we have included a heatmap visualization displaying the distribution of crashes since 1982, which reveals distinct territorial patterns. These findings highlight the importance of continued efforts to improve aviation safety and provide insights into potential areas for improvement.

![crashes-heatmap](./data/images/crashes-heatmap.png)

### Related work

As the dataset is avaliable on the Kaggle, various scientists and enthusiasts have uploaded their notebooks as part of their data analysis. All of them are available [here](https://www.kaggle.com/datasets/khsamaha/aviation-accident-database-synopses/code?select=AviationData.csv). Some of the most interesting can be found [here](https://www.kaggle.com/code/aqsasadaf/aviation-accident-database-beginners-analysis), [here](https://www.kaggle.com/code/khsamaha/ntsb-us-aviation-accident-up-to-jan-2022) and [here](https://www.kaggle.com/code/weichonggg/team-quby).

Our approach to analyzing the aviation accident dataset differs from previous studies in several ways. Firstly, we enriched the dataset by extracting the cause of each accident from the textual description. This additional information provides valuable insights into the factors contributing to each incident. Secondly, we verified that the coordinates of each crash correspond to the state reported in the incident report, ensuring the accuracy of our spatial analysis. Furthermore, we will be presenting our analysis on an interactive map, allowing users to easily explore trends over time, regional patterns, and other potential patterns of interest. This interactive approach offers a user-friendly way to visualize and explore complex data.

One of the inspirations for our work is the website [flightradar24](https://www.flightradar24.com/). It is a popular flight tracking service that provides real-time flight tracking information for aircraft around the world. Users can interactively access information about aircraft's location, altitude, speed, and flight path. 

Another great interactive site is [flightconnections](https://www.flightconnections.com/). FlightConnections is a website that provides a list of direct flight connections between airports around the world. The website allows users to search for flights by selecting a departure airport and destination airport on the map. It displays a list of all the direct flights available between those two locations, along with information on airlines, flight times, and frequency of service.

## Milestone 2 (7th May, 5pm)

**10% of the final grade**


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

