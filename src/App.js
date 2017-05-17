import React, {Component} from 'react';
import Switch from 'react-toggle-switch';
import Issues from './components/issues';
import config from './config';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      totalCount: '',
      sortDesc: true,
      sortType: 'updated',
      issues: [],
      labelValues: '',
      keywordValues: ''
    };

    this.toggleSortType = this.toggleSortType.bind(this);
    this.toggleSortOrder = this.toggleSortOrder.bind(this);
    this.initiateAPICall = this.initiateAPICall.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);

    this.initiateAPICall(this.state.sortDesc, this.state.sortType, this.state.labelValues, this.state.keywordValues);
  }


  initiateAPICall(sortDesc, sortType, labelValues, keywordValues) {
    let myHeaders = new Headers({
      Authorization: 'token ' + config.apiToken
    });

    let myInit = {
      method: 'GET',
      headers: myHeaders,
      mode: 'cors'
    };

    function formatSearchTerms(searchTerms, label) {
      let terms = searchTerms.split(',');

      let query = '';
      for (let term of terms) {
        query += label + '"' + term.trim() + '"+';
      }
      if (query.length > 0) {
        query = query.slice(0, -1);
      }

      return query;
    }


    let keywordQuery = formatSearchTerms(keywordValues, '');
    let labelQuery = formatSearchTerms(labelValues, 'label:');

    let maybePlus = '+';
    if (keywordQuery === '') {
      maybePlus = '';
    }
    let resultsPerPage = 25;
    let sortOrder = sortDesc ? 'desc' : 'asc';
    let searchQuery = keywordQuery + maybePlus + labelQuery + '&per_page=' + resultsPerPage + '&type=issue&state=open&page=1&sort=' + sortType + '&order=' + sortOrder
    let myRequest = new Request('https://api.github.com/search/issues?q=' + searchQuery);

    let self = this;
    fetch(myRequest, myInit).then(function (response) {
      return response.json();
    }).then(function (data) {
      self.setState({
        totalCount: data.total_count,
        issues: data.items,
        sortDesc: sortDesc,
        sortType: sortType,
        labelValues: labelValues
      });
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Open Source Help Wanted</h1>
          <h2>Find issues you can work on in Github. Be a contributor!</h2>
        </div>

        <div className="app-body">
          <div className="App-intro">
            <p className="total-count">Displaying {this.state.issues.length} of {this.state.totalCount} issues.</p>

            <form>
              <div className="input-elements">
                <div className="label-search-box">
                  <label className="label-name">Github label names</label>
                  <input className="input-element labelSearch" name="labelValues" type="text" placeholder="help wanted, bug"
                         onKeyPress={this.handleFormChange}/>
                  <label className="label-keywords">Keywords</label>
                  <input className="input-element labelKeywords" name="keywordValues" type="text" placeholder="react forms"
                         onKeyPress={this.handleFormChange}/>

                </div>

                <label className="sorting-options">Sorting Options</label>
                <div className="sort-inputs">
                  <div className="input-element">
                    sort by created time
                    <Switch on={this.state.sortType === 'updated'} onClick={this.toggleSortType}/>
                    sorty by updated time
                  </div>

                  <div className="input-element">
                    Oldest first
                    <Switch on={this.state.sortDesc} onClick={this.toggleSortOrder}/>
                    Newest first
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="app-results">
            <Issues data={this.state.issues}/>
          </div>
        </div>
        <footer>
          <p><a href="https://github.com/jeffslofish/open-source-help-wanted">Fork me on Github!</a></p>
        </footer>
      </div>
    );

  }

  toggleSortType() {
    let sortType = 'updated';
    if (this.state.sortType === 'updated') {
      sortType = 'created';
    }
    this.initiateAPICall(this.state.sortDesc, sortType, this.state.labelValues);
  }

  toggleSortOrder() {
    this.initiateAPICall(!this.state.sortDesc, this.state.sortType, this.state.labelValues);
  }

  handleFormChange(e) {
    if (e.key === 'Enter') {
      this.setState({[e.target.name]: e.target.value});
      this.initiateAPICall(
        false,
        false,
        (e.target.name === 'labelValues') ? e.target.value : this.state.labelValues,
        (e.target.name === 'keywordValues') ? e.target.value : this.state.keywordValues);
    }
  }
}

export default App;
