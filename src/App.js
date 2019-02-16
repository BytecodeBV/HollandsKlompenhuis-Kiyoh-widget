import React, { Component } from 'react';
import axios from 'axios';
import X2JS from 'x2js';
import './App.css';

const feedRequest = () => {
    const response = axios({
        method: 'get',
        url: 'https://www.kiyoh.nl/xml/recent_company_reviews.xml',
        params: {
            connectorcode: 'ee4810d178ce427d97a',
            company_id: '4235',
            reviewcount: 'all',
            showextraquestions: '1'
        }
    });
    return response;
};

const getFeedJson = async () => {
    const x2js = new X2JS();
    const xmlResponse = await feedRequest();
    const xmlData = xmlResponse.data;
    const jsonData = x2js.xml2js(xmlData);
    return jsonData;
};

const generateScoreText = scoreObj => {
    const { title, score } = scoreObj;
    return `${title}: ${score}`;
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            scores: null,
            currentID: 0,
        };
        this.loadDataIntoState = this.loadDataIntoState.bind(this);
        this.printScores = this.printScores.bind(this);
    }

    componentDidMount() {
        this.loadDataIntoState();
        this.timeout = setInterval(() => {
            let currentID = this.state.currentID;
            let nextID = ++currentID;
            this.setState({ currentID: nextID });
        }, 1500);
    }

    async loadDataIntoState() {
        const jsonData = await getFeedJson();
        const averages
            = jsonData.default.company.average_scores.questions.question;
        const filteredScores = averages.filter(score => score.score > 0);
        const scores = filteredScores.map(score => generateScoreText(score));
        this.setState({ scores });
    }

    printScores() {
        const scores = this.state.scores;

        if (!scores) {
            return 'Loading...';
        }

        const scoresLength = scores.length;
        const currentID = this.state.currentID;
        const changingText = scores[currentID % scoresLength];
        return changingText;
    }

    render() {
        return (
            <div>
                Als beste beoordeeld!&nbsp;
                { this.printScores() }
            </div>
        );
    }
}

export default App;
