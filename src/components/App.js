import React, { Component } from 'react';
import {
  Form,
  FormControl,
  FormGroup,
  Button,
  Grid,
  Row,
  Col
} from 'react-bootstrap';
import GoogleMapReact from 'google-map-react';
import ReactHighcharts from 'react-highcharts';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { bake_cookie, read_cookie } from 'sfcookies';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';

import marker from '../img/marker2.png';

import styles from './styles';

const cookie_key = 'LOCATION';

const Marker = () => <img src={marker} alt="" style={styles.MARKER_STYLE} />;

class App extends Component {
  constructor() {
    super();
    this.state = {
      isQueryLoading: false,
      isDataLoading: false,
      dataLoaded: false,
      validationState: null,
      locationsArray: [],
      location: '',
      locationID: '',
      currentTemp: 'no data',
      currentWeather: 'no data',
      sundown: 'no data',
      center: { lat: 51.447501, lng: -2.60868 },
      zoom: 7,
      categories: [],
      maxTemps: [],
      avgTemps: [],
      minTemps: []
    };
  }

  componentDidMount() {
    var location = read_cookie(cookie_key);
    if (location.length !== 0) {
      this.setState({ location }, () => {
        this.onSubmit();
      });
    }
  }

  handleErrors(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

  onSubmit() {
    this.setState({ isDataLoading: true });
    let categories = [];
    let maxTemps = [];
    let avgTemps = [];
    let minTemps = [];
    const { location } = this.state;
    const handleErrors = this.handleErrors;
    fetch(`http://interview.toumetisanalytics.com/location/${location}`)
      .then(handleErrors)
      .then(results => {
        return results.json();
      })
      .then(locationData => {
        let locationID = locationData[0].woeid;
        fetch(`http://interview.toumetisanalytics.com/weather/${locationID}`)
          .then(results => {
            return results.json();
          })
          .then(weatherData => {
            let currentTime = new Date(weatherData.time);
            let sunsetTime = new Date(weatherData.sun_set);
            if (sunsetTime > currentTime) {
              let msToSundow = new Date(sunsetTime - currentTime);
              let hoursToSundown = msToSundow.getHours();
              let minsToSundown = msToSundow.getMinutes();
              this.setState({
                sundown: `in ${hoursToSundown} Hours ${minsToSundown} Minutes`
              });
            } else {
              let msToSundow = new Date(currentTime - sunsetTime);
              let hoursToSundown = msToSundow.getHours();
              let minsToSundown = msToSundow.getMinutes();
              this.setState({
                sundown: `${hoursToSundown} Hours ${minsToSundown} Minutes ago`
              });
            }
            let lat_long = weatherData.latt_long.split(',');
            this.setState({
              center: {
                lat: Number(lat_long[0]),
                lng: Number(lat_long[1])
              }
            });
            this.setState({
              currentTemp: weatherData.consolidated_weather[0].the_temp.toFixed(
                2
              ),
              currentWeather:
                weatherData.consolidated_weather[0].weather_state_name,
              validationState: 'success'
            });
            weatherData.consolidated_weather.map(data => {
              var date = new Date(data.applicable_date);
              var day = date.getDate();
              var month = date.getMonth();
              var monthName;
              switch (month) {
                case 0:
                  monthName = 'Jan';
                  break;
                case 1:
                  monthName = 'Feb';
                  break;
                case 2:
                  monthName = 'Mar';
                  break;
                case 3:
                  monthName = 'Apr';
                  break;
                case 4:
                  monthName = 'May';
                  break;
                case 5:
                  monthName = 'Jun';
                  break;
                case 6:
                  monthName = 'Jul';
                  break;
                case 7:
                  monthName = 'Aug';
                  break;
                case 8:
                  monthName = 'Sep';
                  break;
                case 9:
                  monthName = 'Oct';
                  break;
                case 10:
                  monthName = 'Nov';
                  break;
                case 11:
                  monthName = 'Dec';
                  break;
                default:
                  monthName = 'Jan';
              }
              var dayMonth = `${day}. ${monthName}`;
              categories.push(dayMonth);
              var maxTemp = +data.max_temp.toFixed(2);
              var minTemp = +data.min_temp.toFixed(2);
              var avgTemp = +((maxTemp + minTemp) / 2).toFixed(2);
              maxTemps.push(maxTemp);
              avgTemps.push(avgTemp);
              minTemps.push(minTemp);
              return null;
            });
            this.setState({
              dataLoaded: true,
              categories,
              maxTemps,
              avgTemps,
              minTemps,
              isDataLoading: false
            });
            bake_cookie(cookie_key, this.state.location);
          });
      })
      .catch(() =>
        this.setState({ validationState: 'error', isDataLoading: false })
      );
  }

  errorMessage() {
    if (this.state.validationState === 'error') {
      return <h4 className="errMsg">Location not found</h4>;
    }
  }

  renderButton() {
    return (
      <Button
        disabled={this.state.isDataLoading}
        bsStyle="primary"
        onClick={() => {
          this.typeahead.getInstance().blur();
          this.onSubmit();
        }}>
        {this.state.isDataLoading ? 'Loading...' : 'Submit'}
      </Button>
    );
  }

  renderMap() {
    if (this.state.dataLoaded === true) {
      return (
        <Card className="mapCard" style={styles.cardStyle}>
          <h3>Last Location:</h3>
          <div
            style={{
              height: 350,
              width: '100%',
              display: 'flex',
              flexFlow: 'row nowrap',
              justifyContent: 'center',
              padding: 0
            }}>
            <GoogleMapReact
              bootstrapURLKeys={{
                key: 'AIzaSyCNNevvdpZC0MQ2fWOBgu7iqVkgNrN-IcU'
              }}
              center={this.state.center}
              defaultZoom={this.state.zoom}
              options={{
                panControl: false,
                mapTypeControl: false,
                scrollwheel: false
              }}>
              <Marker lat={this.state.center.lat} lng={this.state.center.lng} />
            </GoogleMapReact>
          </div>
        </Card>
      );
    }
  }

  renderChart() {
    var chartConfig = {
      chart: {
        type: 'column'
      },
      title: { text: '' },
      xAxis: {
        categories: this.state.categories
      },
      yAxis: {
        title: {
          text: 'Temperature'
        }
      },
      series: [
        {
          name: 'Max temp',
          data: this.state.maxTemps
        },
        {
          name: 'Avg temp',
          data: this.state.avgTemps
        },
        {
          name: 'Min temp',
          data: this.state.minTemps
        }
      ]
    };
    if (this.state.dataLoaded === true) {
      return (
        <Card className="chartCard" style={styles.cardStyle}>
          <h3>Six Day Forecast</h3>
          <ReactHighcharts config={chartConfig} />
        </Card>
      );
    }
  }

  populateAutocomplete(query) {
    this.setState({ isLoading: true });
    fetch(
      `https://cors-anywhere.herokuapp.com/http://metaweather.com/api/location/search/?query=${query}`
    )
      .then(results => {
        return results.json();
      })
      .then(locationsData => {
        var locationsArray = [];
        locationsData.map(location => {
          locationsArray.push(location.title);
          return null;
        });
        this.setState({ locationsArray, isQueryLoading: false });
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <Grid>
            <Card style={styles.cardStyle}>
              <h2 style={{ margin: 10 }}>Weather Dashboard</h2>
            </Card>
            <Card style={styles.cardStyle}>
              <Form>
                <FormGroup
                  controlId="formValidation"
                  validationState={this.state.validationState}>
                  <AsyncTypeahead
                    ref={typeahead => (this.typeahead = typeahead)}
                    minLength={2}
                    isLoading={this.state.isQueryLoading}
                    options={this.state.locationsArray}
                    placeholder="Enter location"
                    onInputChange={query => {
                      this.setState({
                        location: query,
                        validationState: null
                      });
                      this.populateAutocomplete(query);
                    }}
                    onSearch={e => {
                      return null;
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        this.typeahead.getInstance().blur();
                        this.onSubmit();
                      }
                    }}
                  />
                  <FormControl.Feedback />
                  {this.errorMessage()}
                </FormGroup>
                {this.renderButton()}
              </Form>
            </Card>

            <Row className="show-grid">
              <Col xs={12} md={4}>
                <Card style={styles.cardStyle}>
                  <h3>Current Temp</h3>
                  <h4>{this.state.currentTemp}</h4>
                </Card>
              </Col>

              <Col xs={12} md={4}>
                <Card style={styles.cardStyle}>
                  <h3>Current Weather</h3>
                  <h4>{this.state.currentWeather}</h4>
                </Card>
              </Col>
              <Col xs={12} md={4}>
                <Card style={styles.cardStyle}>
                  <h3>Sundown</h3>
                  <h4>{this.state.sundown}</h4>
                </Card>
              </Col>
            </Row>
            <Row className="show-grid">
              <Col xs={12} md={4} />
              <Col xs={12} md={12}>
                {this.renderMap()}
                <Col xs={12} md={4} />
              </Col>
            </Row>
            {this.renderChart()}
          </Grid>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
