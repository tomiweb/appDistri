import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function VisitaForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [comercios, setComercios] = useState([])
  const [comercioId, setComercioId] = useState(searchParams.get('comercio') || '')
  const [comentarios, setComentarios] = useState('')
  const [articulos, setArticulos] = useState([])
  const [detalles, setDetalles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchComercios()
    fetchArticulos()
  }, [])

  useEffect(() => {
    if (comercioId) {
      cargarStockAnterior()
    }
  }, [comercioId, articulos])

  const fetchComercios = async () => {
    try {
      const { data, error } = await supabase
        .from('comercios')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setComercios(data || [])
    } catch (error) {
      console.error('Error al obtener comercios:', error)
    }
  }

  const fetchArticulos = async () => {
    try {
      const { data, error } = await supabase
        .from('articulos')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setArticulos(data || [])
    } catch (error) {
      console.error('Error al obtener artículos:', error)
    }
  }

  const cargarStockAnterior = async () => {
    if (!comercioId || articulos.length === 0) return

    try {
      // Obtener stock actual de cada artículo para este comercio
      const { data: stockData } = await supabase
        .from('stock_comercio')
        .select('articulo_id, stock_actual')
        .eq('comercio_id', comercioId)

      const stockMap = {}
      stockData?.forEach((s) => {
        stockMap[s.articulo_id] = s.stock_actual
      })

      // Crear detalles con stock anterior cargado
      const nuevosDetalles = articulos.map((articulo) => ({
        articulo_id: articulo.id,
        nombre: articulo.nombre,
        stock_anterior: stockMap[articulo.id] || 0,
        stock_actual: 0,
        ventas: 0,
        reposicion: 0,
        stock_final: 0,
        precio_gio_en_visita: articulo.precio_gio,
        precio_publico_en_visita: articulo.precio_publico,
        importe: 0,
      }))

      setDetalles(nuevosDetalles)
    } catch (error) {
      console.error('Error al cargar stock anterior:', error)
    }
  }

  const actualizarDetalle = (index, campo, valor) => {
    const nuevosDetalles = [...detalles]
    const detalle = { ...nuevosDetalles[index] }

    // Actualizar el campo modificado
    detalle[campo] = parseInt(valor) || 0

    // Recalcular automáticamente
    detalle.ventas = detalle.stock_anterior - detalle.stock_actual
    detalle.stock_final = detalle.stock_actual + detalle.reposicion
    detalle.importe = detalle.ventas * detalle.precio_gio_en_visita

    nuevosDetalles[index] = detalle
    setDetalles(nuevosDetalles)
  }

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + d.importe, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!comercioId) {
      setError('Debes seleccionar un comercio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Crear la visita
      const { data: visitaData, error: visitaError } = await supabase
        .from('visitas')
        .insert([
          {
            comercio_id: comercioId,
            user_id: user?.id,
            fecha_visita: new Date().toISOString(),
            comentarios: comentarios || null,
            total_cobrado: 0,
          },
        ])
        .select()
        .single()

      if (visitaError) throw visitaError

      // 2. Crear los detalles de la visita (solo los que tienen movimiento)
      const detallesConMovimiento = detalles.filter(
        (d) => d.stock_actual > 0 || d.reposicion > 0 || d.ventas !== 0
      )

      if (detallesConMovimiento.length > 0) {
        const detallesParaInsertar = detallesConMovimiento.map((d) => ({
          visita_id: visitaData.id,
          articulo_id: d.articulo_id,
          stock_anterior: d.stock_anterior,
          stock_actual: d.stock_actual,
          ventas: d.ventas,
          reposicion: d.reposicion,
          stock_final: d.stock_final,
          precio_gio_en_visita: d.precio_gio_en_visita,
          precio_publico_en_visita: d.precio_publico_en_visita,
          importe: d.importe,
        }))

        const { error: detallesError } = await supabase
          .from('detalle_visitas')
          .insert(detallesParaInsertar)

        if (detallesError) throw detallesError

        // 3. Actualizar stock_comercio
        for (const detalle of detallesConMovimiento) {
          // Verificar si existe el registro
          const { data: existente } = await supabase
            .from('stock_comercio')
            .select('id')
            .eq('comercio_id', comercioId)
            .eq('articulo_id', detalle.articulo_id)
            .single()

          if (existente) {
            // Actualizar
            await supabase
              .from('stock_comercio')
              .update({
                stock_actual: detalle.stock_final,
                ultima_actualizacion: new Date().toISOString(),
              })
              .eq('id', existente.id)
          } else {
            // Insertar
            await supabase.from('stock_comercio').insert([
              {
                comercio_id: comercioId,
                articulo_id: detalle.articulo_id,
                stock_actual: detalle.stock_final,
                ultima_actualizacion: new Date().toISOString(),
              },
            ])
          }
        }
      }

      navigate(`/visitas/${visitaData.id}`)
    } catch (error) {
      console.error('Error al guardar visita:', error)
      setError(error.message || 'Error al guardar la visita')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Visita</h1>
        <p className="text-gray-600 mt-1">Control de stock y registro de ventas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de comercio */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comercio <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={comercioId}
                onChange={(e) => setComercioId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar comercio...</option>
                {comercios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios
              </label>
              <input
                type="text"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones de la visita (opcional)"
              />
            </div>
          </div>
        </div>

        {/* Tabla de artículos */}
        {comercioId && detalles.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Detalle de Artículos</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ingresá el stock actual encontrado y la reposición realizada
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Artículo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Stock Anterior
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Stock Actual
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Ventas
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Reposición
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Stock Final
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Precio Gio
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detalles.map((detalle, index) => (
                    <tr key={detalle.articulo_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detalle.nombre}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {detalle.stock_anterior}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={detalle.stock_actual}
                          onChange={(e) => actualizarDetalle(index, 'stock_actual', e.target.value)}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">
                        {detalle.ventas}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={detalle.reposicion}
                          onChange={(e) => actualizarDetalle(index, 'reposicion', e.target.value)}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                        {detalle.stock_final}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        ${detalle.precio_gio_en_visita.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        ${detalle.importe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="7" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                      ${calcularTotal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {!comercioId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Seleccioná un comercio para comenzar a registrar la visita
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Botones */}
        {comercioId && (
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Visita'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/visitas')}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
