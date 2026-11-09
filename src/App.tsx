import { useCallback, useMemo, useState } from 'react'
import { FeedbackDialog } from './components/feedback/FeedbackDialog'
import { AppFooter } from './components/layout/AppFooter'
import { Navigation } from './components/layout/Navigation'
import { Sidebar } from './components/layout/Sidebar'
import { StorageNotice } from './components/layout/StorageNotice'
import { Topbar } from './components/layout/Topbar'
import { Toast, type ToastMessage } from './components/ui/Toast'
import { useHashRoute } from './hooks/useHashRoute'
import { useProducts } from './hooks/useProducts'
import { EditProductPage, NewProductPage } from './pages/CalculatorPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProductsPage } from './pages/ProductsPage'
import type { ProfitInput } from './types/profit'
import { emptyFormValues, type ProductFormValues } from './utils/productForm'
import { withResults } from './utils/products'

function App() {
  const [route, navigate] = useHashRoute()
  const { products, status, addProduct, updateProduct, deleteProduct } = useProducts()
  const rows = useMemo(() => withResults(products), [products])
  const [draft, setDraft] = useState<ProductFormValues>(emptyFormValues)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const openFeedback = () => setFeedbackOpen(true)

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'success') => {
    setToast({ id: Date.now(), text, tone })
  }, [])
  const closeToast = useCallback(() => setToast(null), [])

  const goToCalculator = () => navigate({ page: 'calculator' })

  const handleCreate = (input: ProfitInput) => {
    const product = addProduct(input)
    notify(`Товар «${product.input.productName}» сохранён`)
    navigate({ page: 'products', selectedId: product.id })
  }

  const handleUpdate = (id: string, input: ProfitInput) => {
    const updated = updateProduct(id, input)
    if (updated) {
      notify('Изменения сохранены')
      navigate({ page: 'products', selectedId: id })
    } else {
      notify('Товар не найден — возможно, он был удалён', 'error')
    }
  }

  const handleDelete = (id: string) => {
    const name = products.find((p) => p.id === id)?.input.productName
    deleteProduct(id)
    notify(name ? `Товар «${name}» удалён` : 'Товар удалён')
    navigate({ page: 'products' })
  }

  const renderPage = () => {
    switch (route.page) {
      case 'overview':
        return (
          <OverviewPage
            rows={rows}
            onCreate={goToCalculator}
            onOpenProducts={() => navigate({ page: 'products' })}
            onOpenProduct={(id) => navigate({ page: 'products', selectedId: id })}
          />
        )
      case 'calculator': {
        const editing = route.editId ? products.find((p) => p.id === route.editId) : undefined
        if (editing) {
          return (
            <EditProductPage
              key={editing.id}
              product={editing}
              onUpdate={handleUpdate}
              onCancel={() => navigate({ page: 'products', selectedId: editing.id })}
            />
          )
        }
        return (
          <NewProductPage
            draft={draft}
            onDraftChange={setDraft}
            onCreate={handleCreate}
            missingEditId={route.editId}
          />
        )
      }
      case 'products':
        return (
          <ProductsPage
            rows={rows}
            selectedId={route.selectedId}
            onSelect={(id) => navigate({ page: 'products', selectedId: id })}
            onEdit={(id) => navigate({ page: 'calculator', editId: id })}
            onDelete={handleDelete}
            onCreate={goToCalculator}
          />
        )
    }
  }

  return (
    <div className="app">
      <Topbar
        onHome={() => navigate({ page: 'overview' })}
        onNewCalculation={goToCalculator}
        onFeedback={openFeedback}
      />
      <div className="app__body">
        <Sidebar active={route.page} productCount={products.length} onNavigate={navigate} />
        <main className="app__main" id="main">
          <StorageNotice status={status} />
          {renderPage()}
          <AppFooter onFeedback={openFeedback} />
        </main>
      </div>
      <Navigation variant="bottom" active={route.page} productCount={products.length} onNavigate={navigate} />
      <Toast toast={toast} onClose={closeToast} />
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}

export default App
