import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchEvents } from '../actions';
import moment from 'moment';
import $ from "jquery-ajax";
import _ from 'lodash';

class EventSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayLocation: "",
      location: {},
      date: [moment().unix(), moment().add(7, 'days').unix(), 3],
      distance: "1609",
      categories: []
    }
  }

  render() {
    return (
      <div className="EventSearch">
        <div className="location-params">
          <input type="text" placeholder="location" value={this.state.displayLocation} onChange={this.handleTextLocation} />
          <div>
            <button onClick={this.handleGeoLocation}>Detect My Location</button>
          </div>
        </div>
        <div className="date-params">
          <div className={ this.state.date[2] === 1 ? "radio-button active" : "radio-button"} data-date-param="1" onClick={this.handleDate}>today</div>
          <div className={ this.state.date[2] === 2 ? "radio-button active" : "radio-button"} data-date-param="2" onClick={this.handleDate}>tomorrow</div>
          <div className={ this.state.date[2] === 3 ? "radio-button active" : "radio-button"} data-date-param="3" onClick={this.handleDate}>this week</div>
        </div>
        <div className="distance-params">
          <div className={ this.state.distance === "1609" ? "radio-button active" : "radio-button"} data-distance="1609" onClick={this.handleDistance}>1 mile</div>
          <div className={ this.state.distance === "8046" ? "radio-button active" : "radio-button"} data-distance="8046" onClick={this.handleDistance}>5 miles</div>
          <div className={ this.state.distance === "16093" ? "radio-button active" : "radio-button"} data-distance="16093" onClick={this.handleDistance}>10 miles</div>
        </div>
        <div className="categories">
          <div className={ this.state.categories.findIndex(category => {return category === "ARTS_ENTERTAINMENT"}) === -1 ? "category" : "category-active"} id="ARTS_ENTERTAINMENT" onClick={this.handleCatChange}>Arts & Entertainment</div>
          <div className={ this.state.categories.findIndex(category => {return category === "EDUCATION"}) === -1 ? "category" : "category-active"} id="EDUCATION" onClick={this.handleCatChange}>Education</div>
          <div className={ this.state.categories.findIndex(category => {return category === "FITNESS_RECREATION"}) === -1 ? "category" : "category-active"} id="FITNESS_RECREATION" onClick={this.handleCatChange}>Fitness & Recreation</div>
          <div className={ this.state.categories.findIndex(category => {return category === "FOOD_BEVERAGE"}) === -1 ? "category" : "category-active"} id="FOOD_BEVERAGE" onClick={this.handleCatChange}>Food & Beverage</div>
          <div className={ this.state.categories.findIndex(category => {return category === "HOTEL_LODGING"}) === -1 ? "category" : "category-active"} id="HOTEL_LODGING" onClick={this.handleCatChange}>Hotel & Lodging</div>
          <div className={ this.state.categories.findIndex(category => {return category === "MEDICAL_HEALTH"}) === -1 ? "category" : "category-active"} id="MEDICAL_HEALTH" onClick={this.handleCatChange}>Medical & Health</div>
          <div className={ this.state.categories.findIndex(category => {return category === "SHOPPING_RETAIL"}) === -1 ? "category" : "category-active"} id="SHOPPING_RETAIL" onClick={this.handleCatChange}>Shopping & Retail</div>
          <div className={ this.state.categories.findIndex(category => {return category === "TRAVEL_TRANSPORTATION"}) === -1 ? "category" : "category-active"} id="TRAVEL_TRANSPORTATION" onClick={this.handleCatChange}>Travel & Transportation</div>
        </div>
        <button className="primaryButton" onClick={this.handleSubmit}>Fetch Events</button>
      </div>
    );
  }

  handleDate = (event) => {
    const dateParam = event.target.dataset.dateParam;
    const nowUnix = moment().unix();
    const endOfTodayUnix = moment().endOf("day").unix();
    const endOfTomorrowUnix = moment().endOf("day").add(1, 'days').unix();
    const endOfWeekUnix = moment().add(7, 'days').unix();
    if (dateParam === "1") {
      this.setState({
        date: [nowUnix, endOfTodayUnix, 1]
      })
    } else if (dateParam === "2") {
      this.setState({
        date: [endOfTodayUnix, endOfTomorrowUnix, 2]
      })
    } else {
      this.setState({
        date: [nowUnix, endOfWeekUnix, 3]
      })
    }
  };

  handleDistance = (event) => {
    this.setState({
        distance: event.target.dataset.distance
      })
  };

  handleCatChange = (event) => {
    const clickedCategory = event.target.id;    
    const categoryIndex = this.state.categories.findIndex(category => {
        return category === clickedCategory;
    });
    if (categoryIndex === -1) {
      this.setState(prevState => ({
        categories: [...prevState.categories, clickedCategory]
      }));
    } else {
      const newCategories = this.state.categories;
      newCategories.splice(categoryIndex, 1);
      this.setState(prevState => ({
        categories: newCategories
      }));
    }
  };

  handleTextLocation = (event) => {
    this.setState({
      displayLocation: event.target.value
    })
  };

  handleGeoLocation = () => {
    this.setState({
      displayLocation: "Detecting..."
    })
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      this.detectLocation(lat, lon);
    }, (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }, options);
  };

  detectLocation = (lat, lon, text) => {
    $.ajax({
      url: "/api/geolocate/",
      method: "GET",
      data: {
        lat: lat,
        lon: lon,
        text: text
      }
    }).then(geoResponse => {
      const displayLocation = `${geoResponse.city}, ${geoResponse.administrativeLevels.level1short}`;
      this.setState({
          location: geoResponse,
          displayLocation: displayLocation
      })
    });
  };

  detectTextLocation = (text) => {
    $.ajax({
      url: "/api/geolocate/",
      method: "GET",
      data: { text: text }
    }).then(geoResponse => {
      this.setState({ location: geoResponse })
    }).then(() => {
      this.props.fetchEvents(
        this.state.location,
        this.state.date,
        this.state.distance,
        this.state.categories
      )}
    )};

  handleSubmit = (event) => {
    event.preventDefault();
    if (_.isEmpty(this.state.location)) {
      const text = this.state.displayLocation;
      this.detectTextLocation(text)
    } else {
      this.props.fetchEvents(
        this.state.location,
        this.state.date,
        this.state.distance,
        this.state.categories
      )
    }
  };

} // end of component

const mapActionsToProps = {
  fetchEvents
};

export default connect(null, mapActionsToProps)(EventSearch);
