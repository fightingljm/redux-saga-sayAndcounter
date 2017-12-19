/*eslint-disable no-unused-vars */
import React, { Component, PropTypes } from 'react'

const Counter = ({ value, onSayHello, onSayGoodbye }) =>
      <div>
        <button onClick={onSayHello}>
          say hello
        </button>
        {' '}
        <button onClick={onSayGoodbye}>
          say good bye
        </button>
        <hr />
        <div>
          {value}
        </div>
      </div>

Counter.propTypes = {
  value: PropTypes.string.isRequired,
  onSayHello: PropTypes.func.isRequired,
  onSayGoodbye: PropTypes.func.isRequired
}

export default Counter
