# RottenApples

* Hosted prototype: http://MrCsabaToth.github.io/RottenApples/
* This application was developed for the Hack For Health Fresno / Civic Hacking Day during a 4 hour sprint
* Date: 6/6/2015
* Hackathon location: Bitwise Industries

# User Story

* A user could query and drill down into aggregated data about health care facilities in Fresno area easily.
* Utilizing speech recognition of mobile platforms (part of the platforms, not our project)

# Client Side

* Pure HTML5/CSS/JavaScript
* Since mobile usage was a primary goal, the whole UI is taken up by Google Maps canvas
* Spanish multi-language support
* The data visualization will be done by a combination of multi-level radial context menus (thank you Synfusion https://www.syncfusion.com/products/javascript/ejradialmenu) when the user clicks on custom pin (demoed at the pitch, but currently under development), followed by information boxes and graphs
* Future: getting data visualization working and fancy

# Server side

* we integrated 60+ datasets
* The query by a key word will filter that data
* Written in Python
* NLP queries in the future?
* Possible regression of datasets where several year is available
* Server side haven't been plugged-in to the client side yet

# Developers

* Client side: Csaba Toth
* Server side: Bryant Cardwell
