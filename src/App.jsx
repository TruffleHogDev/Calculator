import { useReducer } from "react"; {/*Similar to useState, but useful for multiple pieces of state that rely on complex logic*/}
import DigitButton from "./DigitButton.jsx"
import OperationButton from "./OperationButton.jsx"

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}

{/*Switch is used to perform different actions based on different conditions.*/}
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      /*On evaluation, lets us overwrite with our new values */
      if (state.overwrite) {
        return {
          ...state, 
          currentOperand: payload.digit, 
          overwrite: false,
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
       } /*Returns without making any changes*/
      if (payload.digit === "." && state.currentOperand == null) {
        return {
          ...state, 
          currentOperand: `${'0.'}`,
        } /*Handles inputting decimals first */
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) { /*Only applies to cases with decimals mid-string, not if you start with a decimal in an empty field.*/
       return state
      }

     return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`, /*Takes selected digit and adds it to the end of our current operand, or if empty will default to an empty string.*/
      }

    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      /*Allows updating of operands if you misinput*/
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      /*Makes it so the current operand becomes the previous one if it's the first in a non-empty field. */
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation, 
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }

      return {
        ...state, 
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null
      }
    
    case ACTIONS.CLEAR:
      return {}

    case ACTIONS.DELETE_DIGIT:
      /*Preemptively lets us be clear that we only want to delete the current operand*/
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }
      if (state.currentOperand == null) {
      return state
      }
      /*Resets value if there's only one digit instead of leaving it as a value in an empty string*/
      if (state.currentOperand.length === 1) {
        return {...state, currentOperand: null}
      }

      /*Default case after all checks are cleared*/
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }

    case ACTIONS.EVALUATE:
      if (state.operation == null || state.currentOperand == null || state.previousOperand == null /*Checking to make sure we have all needed values before attempting to evaluate*/
      ) {
        return state
      }

      else return {
        ...state,
        overwrite: true,
        previousOperand: null, 
        operation: null, 
        currentOperand: evaluate(state),
      }
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  switch(operation) {
    case "+":
      computation = prev + current
      break /*To make sure we don't go into our next case statement by accident*/
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break
  }

  return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0, /*Necessary to separate the integer from non-integer values to prevent spaghet*/
})

function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split('.')
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

export default function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
     {}
    )

  return(
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}
        </div>
      </div>
      {/*Calculator buttons*/}
      <button 
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
        >
        AC
        </button> {/*Don't add a payload because there is nothing to pass*/}
      <button
        onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}
      >
      DEL
      </button>
      <OperationButton operation="÷" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <button 
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
        >
        =
        </button>
    </div>
  )
}