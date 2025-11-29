import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function Visitas() {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVisitas()
  }, [])

  const fetchVisitas = async () => {
    try {
      const { data, error } = await supabase
        .from('visitas')
        .select('*, comercios(nombre), detalle_visitas(importe)')
        .order('fecha_visita', { ascending: false })

      if (error) throw error

      setVisitas(data || [])
    } catch (error) {
      console.error('Error al obtener visitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularTotal = (detalles) => {
    return detalles?.reduce((sum, d) => sum + parseFloat(d.importe || 0), 0) || 0
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitas</h1>
          <p className="text-gray-600 mt-1">Registro de visitas y control de stock</p>
        </div>
        <Link
          to="/visitas/nueva"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Nueva Visita
        </Link>
      </div>

      {visitas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay visitas registradas</p>
          <Link
            to="/visitas/nueva"
            className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
          >
            Registrar la primera visita
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comercio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comentarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitas.map((visita) => (
                  <tr key={visita.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(visita.fecha_visita), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {visita.comercios?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {visita.comentarios || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      ${calcularTotal(visita.detalle_visitas).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/visitas/${visita.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
