import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)

  const transactions = useMemo(() => paginatedTransactions?.data ?? transactionsByEmployee ?? null, [
    paginatedTransactions,
    transactionsByEmployee,
  ])

  const loadAllTransactions = useCallback(
    async (appendData: boolean = false) => {
      setIsLoading(true)
      transactionsByEmployeeUtils.invalidateData()

      await employeeUtils.fetchAll(false)
      setIsLoading(false) //Bug #5 fix. Moved this line to after employees fetched
      await paginatedTransactionsUtils.fetchAll(appendData)
    },
    [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            } //Bug #3 fix: Check if id is empty, load all employees in that case
            else if (newValue.id === "") {
              await loadAllTransactions()
            } else await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null &&
            paginatedTransactions?.nextPage != null &&
            transactionsByEmployee?.length !== 0 && (
              //Bug #6 fix above. The button is not shown if there is no more data or if an employee is selected
              <button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading}
                onClick={async () => {
                  await loadAllTransactions(true) // pass true to append the new data
                }}
              >
                View More
              </button>
            )}
        </div>
      </main>
    </Fragment>
  )
}
