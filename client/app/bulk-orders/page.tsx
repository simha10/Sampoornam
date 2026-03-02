import React from 'react'
import AppHeader from '../components/AppHeader'

const BulkOrders = () => {
    return (
        <>
            <main className="min-h-screen bg-[#0a0a0a]">
                <AppHeader />
                <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 sm:px-10 sm:pt-28 lg:px-16">
                    <div className="text-center mt-10">
                        <h1 className="text-4xl font-bold">Bulk Orders</h1>
                        <p className="text-lg">Coming Soon...</p>
                    </div>
                </div>
            </main>
        </>
    )
}

export default BulkOrders