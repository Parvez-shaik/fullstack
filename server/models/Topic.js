const Topic = {
  getAllTopics: (db, callback) => {
    db.query('SELECT * FROM topics', callback);
  },
  createTopic: (db, name, userId, callback) => {
    db.query('INSERT INTO topics (name, created_by) VALUES ($1, $2) RETURNING *', [name, userId], callback);
  },
  getVoteCounts: (db, topicId, callback) => {
    db.query(
      'SELECT COUNT(*) AS yes_votes FROM votes WHERE topic_id = $1 AND vote = 1',
      [topicId],
      (err, yesResults) => {
        if (err) return callback(err);
        db.query(
          'SELECT COUNT(*) AS no_votes FROM votes WHERE topic_id = $1 AND vote = 0',
          [topicId],
          (err, noResults) => {
            if (err) return callback(err);
            callback(null, {
              yes_votes: yesResults.rows[0].yes_votes,
              no_votes: noResults.rows[0].no_votes
            });
          }
        );
      }
    );
  }
};

module.exports = Topic;
