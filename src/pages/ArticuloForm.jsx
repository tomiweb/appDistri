import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ArticuloForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    categoria: '',
    costo: '',
    precio_gio: '',
    precio_publico: '',
    activo: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEditing) {
      fetchArticulo()
    }
  }, [id])

  const fetchArticulo = async () => {
    try {
      const { data, error } = await supabase
        .from('articulos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        ...data,
        costo: data.costo || '',
        precio_gio: data.precio_gio || '',
        precio_publico: data.precio_publico || '',
      })
    } catch (error) {
      console.error('Error al obtener artículo:', error)
      setError('No se pudo cargar el artículo')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSave = {
        ...formData,
        costo: parseFloat(formData.costo) || 0,
        precio_gio: parseFloat(formData.precio_gio),
        precio_publico: parseFloat(formData.precio_publico),
      }

      if (isEditing) {
        const { error } = await supabase
          .from('articulos')
          .update(dataToSave)
          .eq('id', id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('articulos')
          .insert([dataToSave])

        if (error) throw error
      }

      navigate('/articulos')
    } catch (error) {
      console.error('Error al guardar artículo:', error)
      setError(error.message || 'Error al guardar el artículo')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const calcularMargen = () => {
    const costo = parseFloat(formData.costo) || 0
    const precioPublico = parseFloat(formData.precio_publico) || 0
    if (costo && precioPublico) {
      return (((precioPublico - costo) / precioPublico) * 100).toFixed(1)
    }
    return '0.0'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Modificar datos del artículo' : 'Registrar un nuevo artículo'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Auriculares In-Ear Karsen"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Karsen"
              />
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                type="text"
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Audio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="costo" className="block text-sm font-medium text-gray-700 mb-1">
                Costo
              </label>
              <input
                type="number"
                step="0.01"
                id="costo"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="precio_gio" className="block text-sm font-medium text-gray-700 mb-1">
                Precio Gio <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="precio_gio"
                name="precio_gio"
                required
                value={formData.precio_gio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="precio_publico" className="block text-sm font-medium text-gray-700 mb-1">
                Precio Público <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="precio_publico"
                name="precio_publico"
                required
                value={formData.precio_publico}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {formData.costo && formData.precio_publico && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Margen calculado:</span>{' '}
                <span className="text-blue-600 font-semibold">{calcularMargen()}%</span>
              </p>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Artículo activo
            </label>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Artículo'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/articulos')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
