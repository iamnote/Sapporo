import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import LinearProgress from 'material-ui/lib/linear-progress';
import Divider from 'material-ui/lib/divider';

import { problem, userData, sapporo, language } from '../../api/db.js';
import { getUserTotalScore, problemSolvedCount, getTotalScore, getFinishTime } from '../../library/score_lib.js';

class Rank extends Component {
    problemSolvedCounting (item) {
        return problemSolvedCount(item, this.props._userData);
    }
    renderProblemAnswerRate () {
        if (this.props._language.length === 0) {
            return (
                <div style={{margin: '20px 10px'}}>
                    <h3>Please at least add one language to Multi-Language Configuration</h3>
                </div>
            );
        }
        let defaultLang = this.props._language[0].iso;
        this.sortPropsArray('_problem', (item) => {
            return this.problemSolvedCounting(item);
        });
        return this.props._problem.map((item, key) => {
            let solvedCount = this.problemSolvedCounting(item);
            return (
                <ListItem key={key} primaryText={item.title[defaultLang] || item.tile} secondaryText={String(solvedCount)}>
                    <LinearProgress mode="determinate" max={this.props._userData.length} value={solvedCount}
                                    color="green" style={{height:'15px'}}/>
                </ListItem>
            );
        });
    }
    sortPropsArray (arrayName, compare) {
        let array = this.props[arrayName];
        array.sort((a, b) => {
            let _a = compare(a);
            let _b = compare(b);
            if (_a > _b) {
                return -1;
            } else if (_a < _b) {
                return 1;
            } else {
                return 0;
            }
        });
    }
    userScoreTextFormat (user, score) {
        let finishTime = getFinishTime(user);
        return `Score: ${score}, Finish Time: ${finishTime}`;
    }
    renderAllUser () {
        if (!this.props._userData || this.props._userData.length === 0) return;
        this.sortPropsArray('_userData', (item) => {
            return getUserTotalScore(item, this.props._problem);
        });
        return this.props._userData.map((item, key) => {
            let userTotalScore = getUserTotalScore(item, this.props._problem);
            return (
                <ListItem key={key} primaryText={item.username} secondaryText={this.userScoreTextFormat(item, userTotalScore)}>
                    <LinearProgress mode="determinate" max={getTotalScore(this.props._problem)} value={userTotalScore}
                                    color="coral" style={{height:'15px'}}/>
                </ListItem>
            );
        });
    }
    render () {
        return (
            <div>
                <h3>Problem Solving Count</h3>
                <List>
                    {this.renderProblemAnswerRate()}
                </List>
                <Divider />
                <h3>Ranking</h3>
                <List>
                    {this.renderAllUser()}
                </List>

            </div>
        );
    }
}

Rank.propTypes = {
    _userData: PropTypes.array.isRequired,
    _problem: PropTypes.array.isRequired,
    _sapporo: PropTypes.object,
    _language: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('userData');
    Meteor.subscribe('problem');
    Meteor.subscribe('sapporo');
    Meteor.subscribe('language');
    return {
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch(),
        _sapporo: sapporo.findOne({sapporo: true}),
        _language: language.find({}).fetch()
    };
}, Rank);
