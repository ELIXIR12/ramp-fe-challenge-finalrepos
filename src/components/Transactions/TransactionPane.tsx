import { useState, useEffect } from "react"
import { InputCheckbox } from "../InputCheckbox"
import { TransactionPaneComponent } from "./types"

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

//Bug #7 fix: Added local storage to persist approved
export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  const [approved, setApproved] = useState(() => {
    const storedValue = localStorage.getItem(`transaction-${transaction.id}-approved`)
    return storedValue !== null ? JSON.parse(storedValue) : transaction.approved
  })

  useEffect(() => {
    localStorage.setItem(`transaction-${transaction.id}-approved`, JSON.stringify(approved))
  }, [transaction.id, approved])

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved}
        disabled={loading}
        onChange={async (newValue) => {
          await consumerSetTransactionApproval({
            transactionId: transaction.id,
            newValue,
          })
          setApproved(newValue)
        }}
      />
    </div>
  )
}
