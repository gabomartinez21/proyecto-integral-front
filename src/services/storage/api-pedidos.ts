export class ApiPedidosService {
    private readonly baseUrl = 'http://localhost:8000/api/pedidos';

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('barbarita-token')}`
        };
    }

    async fetchPedidos() {
        const res = await fetch(this.baseUrl, { headers: this.getHeaders() });
        if (!res.ok) throw new Error('Error al cargar los pedidos');
        return res.json();
    }

    async createPedido(payload: any) {
        const res = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al crear pedido');
        }
        return res.json();
    }

    async updatePedido(id: string | number, payload: any) {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al editar el pedido');
        }
        return res.json();
    }

    async updateEstado(pedidoId: string, status: string) {
        const res = await fetch(`${this.baseUrl}/${pedidoId}/estado`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al cambiar estado');
        }
        return res.json();
    }
}

export const apiPedidosService = new ApiPedidosService();