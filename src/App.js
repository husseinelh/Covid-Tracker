import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import Table from './components/Table';
import { sortData, prettyPrintStat } from './util';
import numeral from "numeral";

import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])

  useEffect(() => {
    const getData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map(item => (
            {
              name: item.country,
              value: item.countryInfo.iso2
            }
          ))
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }
    getData()
  }, [])
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => setCountryInfo(data))
  }, [])
  const onCountryChange = async e => {
    const url = e.target.value === 'worldwide' ?
      'https://disease.sh/v3/covid-19/all' :
      `https://disease.sh/v3/covid-19/countries/${e.target.value}`

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setCountry(e.target.value)
        setCountryInfo(data)

        setMapZoom(4)
      })
  }
  return (
    <div className="app">
      <div className="app_left">
        <div className='app__header'>
          <h1>Covid19 Tracker</h1>
          <FormControl className='app__dropdown'>
            <Select variant='outlined' value={country} onChange={onCountryChange}>
              <MenuItem value='worldwide'>Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>
                  {country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </div>
        <div className="app__stats">
          <InfoBox title='Coronavirus Cases' cases={prettyPrintStat(countryInfo.todayCases)} total={numeral(countryInfo.cases).format('0.0a')} />
          <InfoBox title='Recovered' cases={prettyPrintStat(countryInfo.todayRecovered)} total={numeral(countryInfo.recovered).format('0.0a')} />
          <InfoBox title='Deaths' cases={prettyPrintStat(countryInfo.todayDeaths)} total={numeral(countryInfo.deaths).format('0.0a')} />
        </div>
        <Map countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>

      <Card className='app__right'>
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />


        </CardContent>
      </Card>
    </div>
  );
}

export default App;
