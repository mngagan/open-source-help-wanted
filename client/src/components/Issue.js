import React from 'react';
import Avatar from './Avatar';
import Assignee from './Assignee';
import Labels from './Labels';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

const Issue = ({
  issue: {
    user: { avatar_url },
    html_url,
    title,
    assignee,
    created_at,
    updated_at,
    labels,
    body,
    draft,
    state,
  },
}) => {
  return (
    <div className="issue">
      {draft === undefined && state === 'open' && <p>open issue</p>}
      {draft === undefined && state === 'closed' && <p>closed issue</p>}
      {draft !== undefined && state === 'open' && <p>open pr</p>}
      {draft !== undefined && state === 'closed' && <p>closed pr</p>}
      <div className="issue-header">
        <Avatar url={avatar_url} user_url={getUserUrlFromIssueUrl(html_url)} />
        <div className="main">
          <p className="issue-title">
            <a target="_blank" rel="noopener noreferrer" href={html_url}>
              {title}
            </a>
          </p>

          <div className="repo">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={getRepoUrlFromIssueUrl(html_url)}
            >
              {getRepoNameFromIssueUrl(html_url)}
            </a>
            {assignee && <Assignee user={assignee} />}
          </div>
          <Labels labels={labels} />

          <div className="times">
            <div className="timeAgo">
              Created:&nbsp;
              <Moment fromNow parse="YYYY-MM-DDTHH:mm:ssZ">
                {created_at}
              </Moment>
            </div>
            <br />
            <div className="timeAgo">
              Updated:&nbsp;
              <Moment fromNow parse="YYYY-MM-DDTHH:mm:ssZ">
                {updated_at}
              </Moment>
            </div>
          </div>
        </div>
      </div>

      <div className="issue-body">
        {body && (
          <ReactMde
            value={body}
            selectedTab={'preview'}
            generateMarkdownPreview={(markdown) =>
              Promise.resolve(converter.makeHtml(markdown))
            }
          />
        )}
      </div>
    </div>
  );
};

function getRepoUrlFromIssueUrl(html_url) {
  let pattern = /^https:\/\/github.com\/[^/]+\/[^/]+\//;
  let matches = html_url.match(pattern);
  let repoUrl = '';
  if (matches && matches.length > 0) {
    repoUrl = matches[0];
  }
  return repoUrl;
}

function getUserUrlFromIssueUrl(html_url) {
  let pattern = /^https:\/\/github.com\/[^/]+\//;
  let matches = html_url.match(pattern);
  let userUrl = '';
  if (matches && matches.length > 0) {
    userUrl = matches[0];
  }
  return userUrl;
}

function getRepoNameFromIssueUrl(html_url) {
  let pattern = /https:\/\/github.com\/([^/]+)\/([^/]+)\//;
  let matches = html_url.match(pattern);
  let repoName = '';
  if (matches && matches.length > 2) {
    repoName = matches[1] + '/' + matches[2];
  }
  return repoName;
}

Issue.propTypes = {
  issue: PropTypes.shape({
    html_url: PropTypes.string.isRequired,
    user: PropTypes.shape({
      avatar_url: PropTypes.string.isRequired,
    }).isRequired,
    title: PropTypes.string.isRequired,
    assignee: PropTypes.shape({
      html_url: PropTypes.string.isRequired,
      avatar_url: PropTypes.string.isRequired,
    }),
    created_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string.isRequired,
    labels: PropTypes.array.isRequired,
    body: PropTypes.string,
  }).isRequired,
};

export default Issue;
