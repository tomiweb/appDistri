import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Comercios() {
  const [comercios, setComercios] = useState([])
  const [loading, setLoading] = useState(true)
  const [saldos, setSaldos] = useState({})

  useEffect(() => {
    fetchComercios()
  }, [])

  const fetchComercios = async () => {
    try {
      const { data, error } = await supabase
        .from('comercios')
        .select('*')
        .order('nombre')

      if (error) throw error

      setComercios(data || [])

      // Calcular saldos para cada comercio
      for (const comercio of data || []) {
        await calcularSaldo(comercio.id)
      }
    } catch (error) {
      console.error('Error al obtener comercios:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularSaldo = async (comercioId) => {
    try {
      // Total ventas
      const { data: visitas } = await supabase
        .from('visitas')
        .select('id, detalle_visitas(importe)')
        .eq('comercio_id', comercioId)

      const totalVentas = visitas?.reduce((sum, visita) => {
        const importeVisita = visita.detalle_visitas?.reduce(
          (s, d) => s + parseFloat(d.importe || 0),
          0
        )
        return sum + importeVisita
      }, 0) || 0

      // Total cobros
      const { data: cobros } = await supabase
        .from('cobros')
        .select('monto')
        .eq('comercio_id', comercioId)

      const totalCobros = cobros?.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0) || 0

      const saldo = totalVentas - totalCobros

      setSaldos((prev) => ({ ...prev, [comercioId]: saldo }))
    } catch (error) {
      console.error('Error al calcular saldo:', error)
    }
  }

  const toggleActivo = async (id, activo) => {
    try {
      const { error } = await supabase
        .from('comercios')
        .update({ activo: !activo })
        .eq('id', id)

      if (error) throw error

      await fetchComercios()
    } catch (error) {
      console.error('Error al actualizar comercio:', error)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Comercios</h1>
          <p className="text-gray-600 mt-1">Gestión de comercios en consignación</p>
        </div>
        <Link
          to="/comercios/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Nuevo Comercio
        </Link>
      </div>

      {comercios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay comercios registrados</p>
          <Link
            to="/comercios/nuevo"
            className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
          >
            Crear el primer comercio
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comercios.map((comercio) => (
                  <tr key={comercio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{comercio.nombre}</div>
                      <div className="text-sm text-gray-500">{comercio.direccion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comercio.contacto || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comercio.telefono || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${
                          saldos[comercio.id] > 0 ? 'text-orange-600' : 'text-green-600'
                        }`}
                      >
                        ${(saldos[comercio.id] || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActivo(comercio.id, comercio.activo)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          comercio.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {comercio.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/comercios/${comercio.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <Link
                        to={`/comercios/${comercio.id}/editar`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
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
