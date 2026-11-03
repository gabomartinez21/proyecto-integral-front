// Este archivo conecta el frontend de Insumos con tu backend de Python (FastAPI)
export class ApiInsumosService {
  private readonly baseUrl = 'http://localhost:8000/api/insumos';

  // Obtiene el token guardado por el login de Gabriel
  private getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('barbarita-token')}`
    };
    }

  // Llama a tu endpoint GET /api/insumos
  async fetchInsumos() {
    const res = await fetch(this.baseUrl, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al cargar los insumos');
    return res.json();
  }

  // Llama a tu endpoint POST /api/insumos
  async createInsumo(payload: any) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al crear insumo');
    return res.json();
  }

  // Llama a tu endpoint POST /api/insumos/{id}/stock
  async updateStock(insumoId: string, payload: any) {
    const res = await fetch(`${this.baseUrl}/${insumoId}/stock`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al actualizar stock');
    return res.json();
  }
}

export const apiInsumosService = new ApiInsumosService();