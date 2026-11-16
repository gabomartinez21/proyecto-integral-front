export class ApiPedidosService {
    private readonly baseUrl = 'http://localhost:8000/api/pedidos';
    private readonly productosUrl = 'http://localhost:8000/api/productos';
    private readonly comprasUrl = 'http://localhost:8000/api/compras';

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('barbarita-token')}`
        };
    }

    async fetchProductos() {
        const res = await fetch(this.productosUrl, { headers: this.getHeaders() });
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
    }

    async saveProducto(payload: any) {
        const isEdit = Boolean(payload.id);
        const url = isEdit ? `${this.productosUrl}/${payload.id}` : this.productosUrl;
        const res = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                name: payload.name,
                category: payload.category,
                price: Number(payload.price),
                description: payload.description || '',
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al guardar producto');
        }
        return res.json();
    }

    async saveReceta(productId: string, recipe: any[]) {
        const res = await fetch(`${this.productosUrl}/${productId}/receta`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
                recipe: recipe.map((r) => ({
                    ingredientId: Number(r.ingredientId),
                    quantity: Number(r.quantity),
                })),
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al guardar receta');
        }
        return res.json();
    }

    async fetchPedidos() {
        const res = await fetch(this.baseUrl, { headers: this.getHeaders() });
        if (!res.ok) throw new Error('Error al cargar los pedidos');
        return res.json();
    }

    async validarStock(payload: any) {
        const body = {
            ...payload,
            items: payload.items.map((i: any) => ({
                productId: Number(i.productId),
                quantity: Number(i.quantity),
            })),
        };
        const res = await fetch(`${this.baseUrl}/validar-stock`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = typeof err.detail === 'object' ? err.detail.message : err.detail;
            throw new Error(msg || 'Stock insuficiente');
        }
        return res.json();
    }

    async createPedido(payload: any) {
        const body = {
            ...payload,
            items: payload.items.map((i: any) => ({
                productId: Number(i.productId),
                quantity: Number(i.quantity),
            })),
        };
        const res = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al crear pedido');
        }
        return res.json();
    }

    async updatePedido(id: string | number, payload: any) {
        const body = {
            ...payload,
            items: payload.items.map((i: any) => ({
                productId: Number(i.productId),
                quantity: Number(i.quantity),
            })),
        };
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
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
            body: JSON.stringify({ status }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al cambiar estado');
        }
        return res.json();
    }

    async fetchListaSemanal(fechaInicio: string, fechaFin: string) {
        const params = new URLSearchParams({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
        const res = await fetch(`${this.comprasUrl}/lista-semanal?${params.toString()}`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw new Error('Error al obtener lista de compras semanal');
        return res.json();
    }

    async confirmarCompraItem(insumoId: string | number, quantity: number, note?: string) {
        const res = await fetch(`${this.comprasUrl}/confirmar-item`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                insumo_id: Number(insumoId),
                quantity: Number(quantity),
                note: note || 'Compra desde lista semanal',
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Error al registrar compra');
        }
        return res.json();
    }
}

export const apiPedidosService = new ApiPedidosService();