/** User class for message.ly */
const db = require('../db');
const jwt = require('jsonwebtoken');
const {BCRYPT_WORK_FACTOR} = require('../config');
const bcrypt = require('bcrypt');
const ExpressError = require('../expressError');


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const userResult = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5,NOW()::timestamp, NOW())
        RETURNING username, password, first_name, last_name, phone`,
      [ username, hashedPassword, first_name, last_name, phone ] );

    return userResult.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(`SELECT username, password FROM users WHERE username = $1`,[ username ]);
    const hashedPassword = result.rows[0].password;

    return bcrypt.compare( password, hashedPassword );
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query( `UPDATE users SET last_login_at = NOW() WHERE username = $1`, [ username ] );
    return result.rowCount;
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query( `SELECT username, first_name, last_name, phone FROM users` );
    return result.rows;
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at 
        FROM users 
        WHERE username = $1`,
        [ username ]);
    if( result.rows.length === 0 ) throw new ExpressError( 'User not found', 404);
    return result.rows[0];
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const results = await db.query(`
    SELECT m.id, m.body, m.sent_at, m.read_at, m.to_username, u.first_name, u.last_name, u.phone
    FROM messages AS m
    INNER JOIN users AS u
    ON u.username = m.to_username
    WHERE from_username = $1
    `,
    [ username ]);

    return results.rows.map(r => ({
        id: r.id,
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at,
        to_user: {
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone,
          username: r.to_username
        }
      })
    );
  };

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(`
    SELECT m.id, m.from_username, m.body, m.sent_at, m.read_at, u.first_name, u.last_name, u.phone
    FROM messages AS m
    INNER JOIN users AS u
    ON u.username = m.from_username
    WHERE to_username = $1
    `,
    [ username ]);
    console.log(results.rows)
    return results.rows.map(r => ({
      id: r.id,
      body: r.body,
      sent_at: r.sent_at,
      read_at: r.read_at,
      from_user: {
        first_name: r.first_name,
        last_name: r.last_name,
        phone: r.phone,
        username: r.from_username
        }
      })
    );
   }
}


module.exports = User;