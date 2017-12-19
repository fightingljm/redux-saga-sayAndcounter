export default function counter(state = '', action) {
  switch (action.type) {
    case 'SAY_HELLO':
      state = action.msg
      return state
    case 'SAY_GOODBYE':
      state = action.msg
      return state
    default:
      return state
  }
}
