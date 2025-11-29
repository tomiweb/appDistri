import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function VisitaDetalle() {
  const { id } = useParams()
  const [visita, setVisita] = useState(null)
  const [comercio, setComercio] = useState(null)
  const [detalles, setDetalles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVisita()
  }, [id])

  const fetchVisita = async () => {
    try {
      // Obtener visita
      const { data: visitaData, error: visitaError } = await supabase
        .from('visitas')
        .select('*')
        .eq('id', id)
        .single()

      if (visitaError) throw visitaError
      setVisita(visitaData)

      // Obtener comercio
      const { data: comercioData } = await supabase
        .from('comercios')
        .select('*')
        .eq('id', visitaData.comercio_id)
        .single()

      setComercio(comercioData)

      // Obtener detalles con artículos
      const { data: detallesData } = await supabase
        .from('detalle_visitas')
        .select('*, articulos(nombre, marca)')
        .eq('visita_id', id)
        .order('created_at')

      setDetalles(detallesData || [])
    } catch (error) {
      console.error('Error al obtener visita:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + parseFloat(d.importe || 0), 0)
  }

  const imprimirComprobante = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!visita) {
    return <div className="text-center py-12">Visita no encontrada</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Visita</h1>
          <p className="text-gray-600 mt-1">
            {comercio?.nombre} - {format(new Date(visita.fecha_visita), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={imprimirComprobante}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            🖨️ Imprimir
          </button>
          <Link
            to="/visitas"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Comprobante (printable) */}
      <div className="bg-white rounded-lg shadow print:shadow-none">
        <div className="px-6 py-4 border-b print:border-black">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Consignación Giommetti</h2>
            <p className="text-sm text-gray-600 mt-1">Comprobante de Visita</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Comercio:</p>
              <p className="font-semibold">{comercio?.nombre}</p>
              <p className="text-gray-600 text-xs">{comercio?.direccion}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Fecha:</p>
              <p className="font-semibold">{format(new Date(visita.fecha_visita), 'dd/MM/yyyy HH:mm')}</p>
              {visita.comentarios && (
                <p className="text-xs text-gray-500 mt-2">{visita.comentarios}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de detalles */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 print:bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Artículo
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Stock Ant.
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Stock Act.
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Ventas
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Repos.
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Stock Final
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  P. Unitario
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Importe
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detalles.map((detalle) => (
                <tr key={detalle.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {detalle.articulos?.nombre}
                    {detalle.articulos?.marca && (
                      <span className="text-xs text-gray-500 ml-1">({detalle.articulos.marca})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {detalle.stock_anterior}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {detalle.stock_actual}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">
                    {detalle.ventas}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {detalle.reposicion}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                    {detalle.stock_final}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    ${parseFloat(detalle.precio_gio_en_visita).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    ${parseFloat(detalle.importe).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 print:bg-gray-200">
              <tr>
                <td colSpan="7" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Total a Cobrar:
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                  ${calcularTotal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer del comprobante */}
        <div className="px-6 py-4 border-t text-center text-xs text-gray-500 print:border-black">
          <p>Sistema de Gestión de Consignación - Giommetti</p>
          <p className="mt-1">Gracias por su confianza</p>
        </div>
      </div>

      {/* Resumen (no imprimible) */}
      <div className="bg-blue-50 rounded-lg p-6 print:hidden">
        <h3 className="font-semibold text-blue-900 mb-2">Resumen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Total de artículos:</p>
            <p className="text-2xl font-bold text-blue-900">{detalles.length}</p>
          </div>
          <div>
            <p className="text-blue-700">Unidades vendidas:</p>
            <p className="text-2xl font-bold text-blue-900">
              {detalles.reduce((sum, d) => sum + d.ventas, 0)}
            </p>
          </div>
          <div>
            <p className="text-blue-700">Total importe:</p>
            <p className="text-2xl font-bold text-blue-900">
              ${calcularTotal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
