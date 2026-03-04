/**
 * inventory.js — Módulo de gestión de inventario y alertas
 * Contiene funciones para controlar insumos y generar alertas de stock
 */

// -----------------------------------------------------------------------
// Claves de localStorage
// -----------------------------------------------------------------------
const KEYS = {
    inventory: 'academy_inventory',
    inventoryMovements: 'academy_inventory_movements',
    alerts: 'academy_alerts'
}

// -----------------------------------------------------------------------
// Datos iniciales
// -----------------------------------------------------------------------
const INITIAL_INVENTORY = [
    {
        id: 1,
        code: 'NOTEBOOK-001',
        name: 'Notebooks',
        description: 'College ruled notebooks',
        category: 'School Supplies',
        unit: 'units',
        currentStock: 150,
        minStock: 50,
        maxStock: 500,
        unitCost: 2.50,
        unitPrice: 5.00,
        status: 'Active',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 2,
        code: 'PEN-001',
        name: 'Ballpoint Pens',
        description: 'Blue ballpoint pens',
        category: 'School Supplies',
        unit: 'units',
        currentStock: 200,
        minStock: 100,
        maxStock: 1000,
        unitCost: 0.50,
        unitPrice: 1.50,
        status: 'Active',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 3,
        code: 'PAPER-001',
        name: 'Printing Paper',
        description: 'A4 size printing paper',
        category: 'Office Supplies',
        unit: 'reams',
        currentStock: 25,
        minStock: 10,
        maxStock: 100,
        unitCost: 8.00,
        unitPrice: 15.00,
        status: 'Active',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 4,
        code: 'MARKER-001',
        name: 'Whiteboard Markers',
        description: 'Black whiteboard markers',
        category: 'Teaching Supplies',
        unit: 'units',
        currentStock: 30,
        minStock: 15,
        maxStock: 100,
        unitCost: 1.20,
        unitPrice: 3.00,
        status: 'Active',
        lastUpdated: new Date().toISOString()
    }
]

const INITIAL_MOVEMENTS = [
    {
        id: 1,
        itemId: 1,
        type: 'in',
        quantity: 100,
        reason: 'Initial stock',
        reference: 'INIT-001',
        movementDate: new Date().toISOString().split('T')[0],
        userId: 1,
        previousStock: 50,
        newStock: 150
    }
]

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------
export function initializeInventoryData() {
    if (!localStorage.getItem(KEYS.inventory)) {
        localStorage.setItem(KEYS.inventory, JSON.stringify(INITIAL_INVENTORY))
    }
    if (!localStorage.getItem(KEYS.inventoryMovements)) {
        localStorage.setItem(KEYS.inventoryMovements, JSON.stringify(INITIAL_MOVEMENTS))
    }
    if (!localStorage.getItem(KEYS.alerts)) {
        localStorage.setItem(KEYS.alerts, JSON.stringify([]))
    }
}

// -----------------------------------------------------------------------
// Funciones CRUD para Inventario
// -----------------------------------------------------------------------
export function getInventory() {
    const data = localStorage.getItem(KEYS.inventory)
    return data ? JSON.parse(data) : []
}

export function addInventoryItem(item) {
    const inventory = getInventory()
    const newItem = {
        id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
        ...item,
        currentStock: item.currentStock || 0,
        status: item.status || 'Active',
        lastUpdated: new Date().toISOString()
    }
    inventory.push(newItem)
    localStorage.setItem(KEYS.inventory, JSON.stringify(inventory))
    
    // Generar movimiento inicial
    if (item.currentStock > 0) {
        addInventoryMovement({
            itemId: newItem.id,
            type: 'in',
            quantity: item.currentStock,
            reason: 'Initial stock',
            reference: `INIT-${newItem.id}`,
            previousStock: 0,
            newStock: item.currentStock
        })
    }
    
    return newItem
}

export function updateInventoryItem(id, updates) {
    const inventory = getInventory()
    const index = inventory.findIndex(item => item.id === id)
    if (index !== -1) {
        inventory[index] = { ...inventory[index], ...updates, lastUpdated: new Date().toISOString() }
        localStorage.setItem(KEYS.inventory, JSON.stringify(inventory))
        return inventory[index]
    }
    return null
}

export function deleteInventoryItem(id) {
    const inventory = getInventory().filter(item => item.id !== id)
    localStorage.setItem(KEYS.inventory, JSON.stringify(inventory))
    return true
}

export function getInventoryItemById(id) {
    return getInventory().find(item => item.id === id)
}

// -----------------------------------------------------------------------
// Gestión de Movimientos de Inventario
// -----------------------------------------------------------------------
export function getInventoryMovements() {
    const data = localStorage.getItem(KEYS.inventoryMovements)
    return data ? JSON.parse(data) : []
}

export function addInventoryMovement(movement) {
    const movements = getInventoryMovements()
    const newMovement = {
        id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
        ...movement,
        movementDate: movement.movementDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    }
    movements.push(newMovement)
    localStorage.setItem(KEYS.inventoryMovements, JSON.stringify(movements))
    
    // Actualizar stock del item
    updateItemStock(movement.itemId, movement.quantity, movement.type)
    
    return newMovement
}

export function getItemMovements(itemId, limit = 50) {
    const movements = getInventoryMovements()
    return movements
        .filter(m => m.itemId === itemId)
        .sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate))
        .slice(0, limit)
}

// -----------------------------------------------------------------------
// Funciones de Stock y Alertas
// -----------------------------------------------------------------------
export function updateItemStock(itemId, quantity, type) {
    const item = getInventoryItemById(itemId)
    if (!item) return null
    
    const previousStock = item.currentStock
    const newStock = type === 'in' ? previousStock + quantity : previousStock - quantity
    
    if (newStock < 0) {
        throw new Error('Insufficient stock')
    }
    
    updateInventoryItem(itemId, { currentStock: newStock })
    
    // Generar alertas si es necesario
    checkStockAlerts(itemId)
    
    return { previousStock, newStock }
}

export function checkStockAlerts(itemId) {
    const item = getInventoryItemById(itemId)
    if (!item) return
    
    const alerts = getAlerts()
    
    // Alerta de stock mínimo
    if (item.currentStock <= item.minStock) {
        const existingAlert = alerts.find(a => 
            a.itemId === itemId && 
            a.type === 'low_stock' && 
            a.status === 'active'
        )
        
        if (!existingAlert) {
            addAlert({
                itemId: itemId,
                type: 'low_stock',
                message: `Low stock alert: ${item.name} has ${item.currentStock} ${item.unit} (min: ${item.minStock})`,
                priority: 'high',
                status: 'active'
            })
        }
    } else {
        // Desactivar alerta de stock mínimo si ya no aplica
        const existingAlert = alerts.find(a => 
            a.itemId === itemId && 
            a.type === 'low_stock' && 
            a.status === 'active'
        )
        
        if (existingAlert) {
            updateAlert(existingAlert.id, { status: 'resolved' })
        }
    }
    
    // Alerta de stock máximo
    if (item.currentStock >= item.maxStock) {
        const existingAlert = alerts.find(a => 
            a.itemId === itemId && 
            a.type === 'high_stock' && 
            a.status === 'active'
        )
        
        if (!existingAlert) {
            addAlert({
                itemId: itemId,
                type: 'high_stock',
                message: `High stock alert: ${item.name} has ${item.currentStock} ${item.unit} (max: ${item.maxStock})`,
                priority: 'medium',
                status: 'active'
            })
        }
    }
}

// -----------------------------------------------------------------------
// Sistema de Alertas
// -----------------------------------------------------------------------
export function getAlerts() {
    const data = localStorage.getItem(KEYS.alerts)
    return data ? JSON.parse(data) : []
}

export function addAlert(alert) {
    const alerts = getAlerts()
    const newAlert = {
        id: alerts.length > 0 ? Math.max(...alerts.map(a => a.id)) + 1 : 1,
        ...alert,
        createdAt: new Date().toISOString()
    }
    alerts.push(newAlert)
    localStorage.setItem(KEYS.alerts, JSON.stringify(alerts))
    return newAlert
}

export function updateAlert(id, updates) {
    const alerts = getAlerts()
    const index = alerts.findIndex(a => a.id === id)
    if (index !== -1) {
        alerts[index] = { ...alerts[index], ...updates, updatedAt: new Date().toISOString() }
        localStorage.setItem(KEYS.alerts, JSON.stringify(alerts))
        return alerts[index]
    }
    return null
}

export function getActiveAlerts() {
    return getAlerts().filter(a => a.status === 'active')
}

export function getAlertsByPriority(priority) {
    return getAlerts().filter(a => a.priority === priority && a.status === 'active')
}

// -----------------------------------------------------------------------
// Reportes y Análisis de Inventario
// -----------------------------------------------------------------------
export function getInventorySummary() {
    const inventory = getInventory()
    const alerts = getActiveAlerts()
    
    const totalItems = inventory.length
    const activeItems = inventory.filter(i => i.status === 'Active').length
    const lowStockItems = inventory.filter(i => i.currentStock <= i.minStock).length
    const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
    
    return {
        totalItems: totalItems,
        activeItems: activeItems,
        lowStockItems: lowStockItems,
        totalValue: totalValue,
        activeAlerts: alerts.length,
        highPriorityAlerts: alerts.filter(a => a.priority === 'high').length
    }
}

export function getInventoryByCategory() {
    const inventory = getInventory()
    const categories = {}
    
    inventory.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = {
                category: item.category,
                items: 0,
                totalValue: 0,
                lowStockItems: 0
            }
        }
        
        categories[item.category].items++
        categories[item.category].totalValue += item.currentStock * item.unitCost
        
        if (item.currentStock <= item.minStock) {
            categories[item.category].lowStockItems++
        }
    })
    
    return Object.values(categories)
}

export function getMovementsByDateRange(startDate, endDate) {
    const movements = getInventoryMovements()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return movements.filter(movement => {
        const movementDate = new Date(movement.movementDate)
        return movementDate >= start && movementDate <= end
    })
}

// -----------------------------------------------------------------------
// Funciones de utilidad
// -----------------------------------------------------------------------
export function processInventoryAdjustment(itemId, newQuantity, reason) {
    const item = getInventoryItemById(itemId)
    if (!item) {
        throw new Error('Item not found')
    }
    
    const difference = newQuantity - item.currentStock
    const movementType = difference > 0 ? 'in' : 'out'
    const quantity = Math.abs(difference)
    
    if (difference !== 0) {
        addInventoryMovement({
            itemId: itemId,
            type: movementType,
            quantity: quantity,
            reason: reason,
            reference: `ADJ-${Date.now()}`,
            previousStock: item.currentStock,
            newStock: newQuantity
        })
    }
    
    return { previousStock: item.currentStock, newStock: newQuantity }
}

export function getLowStockItems() {
    const inventory = getInventory()
    return inventory
        .filter(item => item.currentStock <= item.minStock && item.status === 'Active')
        .map(item => ({
            ...item,
            shortage: item.minStock - item.currentStock,
            shortagePercentage: ((item.minStock - item.currentStock) / item.minStock) * 100
        }))
        .sort((a, b) => b.shortagePercentage - a.shortagePercentage)
}
