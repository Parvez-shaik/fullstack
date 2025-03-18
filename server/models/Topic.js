const Topic = {
  getAllTopics: (db, callback) => {
    db.query('SELECT * FROM topics', callback);
  },
  createTopic: (db, name, userId, callback) => {
    db.query('INSERT INTO topics (name, created_by) VALUES (?, ?)', [name, userId], callback);
  },
  getVoteCounts: (db, topicId, callback) => {
    db.query(
      'SELECT COUNT(*) AS yes_votes FROM votes WHERE topic_id = ? AND vote = "yes"',
      [topicId],
      (err, yesResults) => {
        if (err) return callback(err);
        db.query(
          'SELECT COUNT(*) AS no_votes FROM votes WHERE topic_id = ? AND vote = "no"',
          [topicId],
          (err, noResults) => {
            if (err) return callback(err);
            callback(null, {
              yes_votes: yesResults[0].yes_votes,
              no_votes: noResults[0].no_votes
            });
          }
        );
      }
    );
  }
};

module.exports = Topic;
