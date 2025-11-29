import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function ComercioDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comercio, setComercio] = useState(null)
  const [saldo, setSaldo] = useState(0)
  const [visitas, setVisitas] = useState([])
  const [cobros, setCobros] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCobroForm, setShowCobroForm] = useState(false)
  const [cobroForm, setCobroForm] = useState({
    monto: '',
    metodo_pago: 'efectivo',
    fecha_pago: new Date().toISOString().split('T')[0],
    observaciones: '',
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      // Obtener comercio
      const { data: comercioData, error: comercioError } = await supabase
        .from('comercios')
        .select('*')
        .eq('id', id)
        .single()

      if (comercioError) throw comercioError
      setComercio(comercioData)

      // Obtener visitas
      const { data: visitasData } = await supabase
        .from('visitas')
        .select('id, fecha_visita, comentarios, detalle_visitas(importe)')
        .eq('comercio_id', id)
        .order('fecha_visita', { ascending: false })

      setVisitas(visitasData || [])

      // Calcular total de ventas
      const totalVentas = visitasData?.reduce((sum, visita) => {
        const importeVisita = visita.detalle_visitas?.reduce(
          (s, d) => s + parseFloat(d.importe || 0),
          0
        )
        return sum + importeVisita
      }, 0) || 0

      // Obtener cobros
      const { data: cobrosData } = await supabase
        .from('cobros')
        .select('*')
        .eq('comercio_id', id)
        .order('fecha_pago', { ascending: false })

      setCobros(cobrosData || [])

      // Calcular total de cobros
      const totalCobros = cobrosData?.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0) || 0

      setSaldo(totalVentas - totalCobros)
    } catch (error) {
      console.error('Error al obtener datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCobroSubmit = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from('cobros').insert([
        {
          comercio_id: id,
          ...cobroForm,
          monto: parseFloat(cobroForm.monto),
        },
      ])

      if (error) throw error

      setShowCobroForm(false)
      setCobroForm({
        monto: '',
        metodo_pago: 'efectivo',
        fecha_pago: new Date().toISOString().split('T')[0],
        observaciones: '',
      })
      await fetchData()
    } catch (error) {
      console.error('Error al registrar cobro:', error)
      alert('Error al registrar el cobro')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!comercio) {
    return <div className="text-center py-12">Comercio no encontrado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{comercio.nombre}</h1>
          <p className="text-gray-600 mt-1">{comercio.direccion}</p>
          {comercio.contacto && (
            <p className="text-sm text-gray-500 mt-1">
              Contacto: {comercio.contacto} {comercio.telefono && `- ${comercio.telefono}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/comercios/${id}/editar`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Editar
          </Link>
          <Link
            to={`/visitas/nueva?comercio=${id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            + Nueva Visita
          </Link>
        </div>
      </div>

      {/* Tarjeta de Saldo */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Saldo Pendiente</h3>
            <p className={`text-3xl font-bold mt-2 ${saldo > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              ${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={() => setShowCobroForm(!showCobroForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            + Registrar Cobro
          </button>
        </div>

        {/* Formulario de Cobro */}
        {showCobroForm && (
          <form onSubmit={handleCobroSubmit} className="mt-6 pt-6 border-t space-y-4">
            <h4 className="font-medium text-gray-900">Nuevo Cobro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cobroForm.monto}
                  onChange={(e) => setCobroForm({ ...cobroForm, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={cobroForm.fecha_pago}
                  onChange={(e) => setCobroForm({ ...cobroForm, fecha_pago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <select
                  value={cobroForm.metodo_pago}
                  onChange={(e) => setCobroForm({ ...cobroForm, metodo_pago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={cobroForm.observaciones}
                  onChange={(e) => setCobroForm({ ...cobroForm, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Guardar Cobro
              </button>
              <button
                type="button"
                onClick={() => setShowCobroForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Historial de Visitas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Visitas</h3>
        </div>
        <div className="p-6">
          {visitas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay visitas registradas</p>
          ) : (
            <div className="space-y-4">
              {visitas.map((visita) => {
                const totalVisita = visita.detalle_visitas?.reduce(
                  (s, d) => s + parseFloat(d.importe || 0),
                  0
                ) || 0
                return (
                  <div
                    key={visita.id}
                    className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(visita.fecha_visita), 'dd/MM/yyyy HH:mm')}
                      </p>
                      {visita.comentarios && (
                        <p className="text-sm text-gray-500 mt-1">{visita.comentarios}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        ${totalVisita.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                      <Link
                        to={`/visitas/${visita.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                      >
                        Ver detalle →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Historial de Cobros */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Cobros</h3>
        </div>
        <div className="p-6">
          {cobros.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay cobros registrados</p>
          ) : (
            <div className="space-y-4">
              {cobros.map((cobro) => (
                <div
                  key={cobro.id}
                  className="flex justify-between items-center p-4 border rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(cobro.fecha_pago), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Método: {cobro.metodo_pago}
                      {cobro.observaciones && ` - ${cobro.observaciones}`}
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    ${parseFloat(cobro.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
