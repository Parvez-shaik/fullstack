const db = require('../server').db;

const Topic = {
  getAllTopics: (callback) => {
    db.query('SELECT * FROM topics', callback);
  },
  createTopic: (name, callback) => {
    db.query('INSERT INTO topics (name, yes_votes, no_votes) VALUES (?, 0, 0)', [name], callback);
  },
  vote: (topicId, vote, callback) => {
    const voteColumn = vote === 'yes' ? 'yes_votes' : 'no_votes';
    db.query(`UPDATE topics SET ${voteColumn} = ${voteColumn} + 1 WHERE id = ?`, [topicId], callback);
  },
};

module.exports = Topic;
