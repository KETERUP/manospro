export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agenda_eventos: {
        Row: {
          cliente_id: string | null
          created_at: string
          descripcion: string | null
          empresa_id: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          notificado: boolean | null
          proyecto_id: string | null
          recordatorio_minutos: number | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          empresa_id: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          notificado?: boolean | null
          proyecto_id?: string | null
          recordatorio_minutos?: number | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          empresa_id?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          notificado?: boolean | null
          proyecto_id?: string | null
          recordatorio_minutos?: number | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist: {
        Row: {
          completado: boolean | null
          created_at: string
          descripcion: string | null
          id: string
          orden: number | null
          proyecto_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          completado?: boolean | null
          created_at?: string
          descripcion?: string | null
          id?: string
          orden?: number | null
          proyecto_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          completado?: boolean | null
          created_at?: string
          descripcion?: string | null
          id?: string
          orden?: number | null
          proyecto_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          direccion: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nif_cif: string | null
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nif_cif?: string | null
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nif_cif?: string | null
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          created_at: string
          id: string
          nombre: string
          proyecto_id: string
          tamanio_bytes: number | null
          tipo_documento: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          proyecto_id: string
          tamanio_bytes?: number | null
          tipo_documento?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          proyecto_id?: string
          tamanio_bytes?: number | null
          tipo_documento?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cif: string
          created_at: string
          direccion_fiscal: string
          email: string
          id: string
          iva_por_defecto: number
          nombre: string
          telefono: string
          updated_at: string
        }
        Insert: {
          cif: string
          created_at?: string
          direccion_fiscal: string
          email: string
          id?: string
          iva_por_defecto?: number
          nombre: string
          telefono: string
          updated_at?: string
        }
        Update: {
          cif?: string
          created_at?: string
          direccion_fiscal?: string
          email?: string
          id?: string
          iva_por_defecto?: number
          nombre?: string
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      facturas: {
        Row: {
          base_imponible: number
          cliente_id: string | null
          created_at: string
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_factura"]
          fecha_emision: string
          id: string
          iva: number
          numero_factura: string
          proyecto_id: string | null
          total: number
          updated_at: string
        }
        Insert: {
          base_imponible?: number
          cliente_id?: string | null
          created_at?: string
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_factura"]
          fecha_emision?: string
          id?: string
          iva?: number
          numero_factura: string
          proyecto_id?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          base_imponible?: number
          cliente_id?: string | null
          created_at?: string
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_factura"]
          fecha_emision?: string
          id?: string
          iva?: number
          numero_factura?: string
          proyecto_id?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      fotos_proyecto: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          proyecto_id: string
          tipo: string | null
          url: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          proyecto_id: string
          tipo?: string | null
          url: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          proyecto_id?: string
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_proyecto_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos: {
        Row: {
          created_at: string
          descripcion: string
          foto_boleta: string | null
          id: string
          monto: number
          obra_id: string
          proveedor_id: string | null
        }
        Insert: {
          created_at?: string
          descripcion: string
          foto_boleta?: string | null
          id?: string
          monto: number
          obra_id: string
          proveedor_id?: string | null
        }
        Update: {
          created_at?: string
          descripcion?: string
          foto_boleta?: string | null
          id?: string
          monto?: number
          obra_id?: string
          proveedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      horas_trabajadas: {
        Row: {
          created_at: string
          descripcion: string | null
          fecha: string
          horas: number
          id: string
          proyecto_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          fecha: string
          horas: number
          id?: string
          proyecto_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          fecha?: string
          horas?: number
          id?: string
          proyecto_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horas_trabajadas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      items_factura: {
        Row: {
          cantidad: number
          concepto: string
          created_at: string
          factura_id: string
          id: string
          precio_total: number
          precio_unitario: number
        }
        Insert: {
          cantidad: number
          concepto: string
          created_at?: string
          factura_id: string
          id?: string
          precio_total: number
          precio_unitario: number
        }
        Update: {
          cantidad?: number
          concepto?: string
          created_at?: string
          factura_id?: string
          id?: string
          precio_total?: number
          precio_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_factura_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
      }
      items_presupuesto: {
        Row: {
          created_at: string
          descripcion: string
          id: string
          obra_id: string
          precio: number
        }
        Insert: {
          created_at?: string
          descripcion: string
          id?: string
          obra_id: string
          precio: number
        }
        Update: {
          created_at?: string
          descripcion?: string
          id?: string
          obra_id?: string
          precio?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_presupuesto_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      items_presupuesto_detalle: {
        Row: {
          cantidad: number
          concepto: string
          created_at: string
          id: string
          precio_total: number
          precio_unitario: number
          presupuesto_id: string
        }
        Insert: {
          cantidad: number
          concepto: string
          created_at?: string
          id?: string
          precio_total: number
          precio_unitario: number
          presupuesto_id: string
        }
        Update: {
          cantidad?: number
          concepto?: string
          created_at?: string
          id?: string
          precio_total?: number
          precio_unitario?: number
          presupuesto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_presupuesto_detalle_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
        ]
      }
      materiales: {
        Row: {
          coste_unitario: number
          created_at: string
          descripcion: string | null
          empresa_id: string
          id: string
          nombre: string
          proveedor_id: string
          stock_actual: number
          unidad_medida: string | null
          updated_at: string
        }
        Insert: {
          coste_unitario?: number
          created_at?: string
          descripcion?: string | null
          empresa_id: string
          id?: string
          nombre: string
          proveedor_id: string
          stock_actual?: number
          unidad_medida?: string | null
          updated_at?: string
        }
        Update: {
          coste_unitario?: number
          created_at?: string
          descripcion?: string | null
          empresa_id?: string
          id?: string
          nombre?: string
          proveedor_id?: string
          stock_actual?: number
          unidad_medida?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiales_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiales_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          cliente_id: string | null
          created_at: string
          descripcion: string | null
          direccion_obra: string | null
          empresa_id: string | null
          estado: Database["public"]["Enums"]["estado_proyecto"]
          fecha_fin: string | null
          fecha_inicio: string | null
          fecha_visita: string | null
          ganancia_neta: number | null
          id: string
          imagen_proyecto: string | null
          latitud: number | null
          longitud: number | null
          monto_adelantado: number | null
          monto_total: number | null
          nombre_obra: string
          total_gastado: number
          total_presupuestado: number
          trabajador_asignado_id: string | null
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          direccion_obra?: string | null
          empresa_id?: string | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_visita?: string | null
          ganancia_neta?: number | null
          id?: string
          imagen_proyecto?: string | null
          latitud?: number | null
          longitud?: number | null
          monto_adelantado?: number | null
          monto_total?: number | null
          nombre_obra: string
          total_gastado?: number
          total_presupuestado?: number
          trabajador_asignado_id?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          direccion_obra?: string | null
          empresa_id?: string | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_visita?: string | null
          ganancia_neta?: number | null
          id?: string
          imagen_proyecto?: string | null
          latitud?: number | null
          longitud?: number | null
          monto_adelantado?: number | null
          monto_total?: number | null
          nombre_obra?: string
          total_gastado?: number
          total_presupuestado?: number
          trabajador_asignado_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuestos: {
        Row: {
          cliente_id: string | null
          created_at: string
          descripcion: string | null
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_emision: string
          fecha_validez: string | null
          firma_cliente: boolean | null
          id: string
          iva: number
          numero_presupuesto: string
          proyecto_id: string | null
          subtotal: number
          titulo: string
          total: number
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_emision?: string
          fecha_validez?: string | null
          firma_cliente?: boolean | null
          id?: string
          iva?: number
          numero_presupuesto: string
          proyecto_id?: string | null
          subtotal?: number
          titulo: string
          total?: number
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          fecha_emision?: string
          fecha_validez?: string | null
          firma_cliente?: boolean | null
          id?: string
          iva?: number
          numero_presupuesto?: string
          proyecto_id?: string | null
          subtotal?: number
          titulo?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presupuestos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          empresa_id: string | null
          id: string
          nombre_completo: string
        }
        Insert: {
          created_at?: string
          empresa_id?: string | null
          id: string
          nombre_completo: string
        }
        Update: {
          created_at?: string
          empresa_id?: string | null
          id?: string
          nombre_completo?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          cif: string | null
          created_at: string
          direccion: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nombre: string
          telefono: string | null
          tipo_material: string | null
          updated_at: string | null
        }
        Insert: {
          cif?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          tipo_material?: string | null
          updated_at?: string | null
        }
        Update: {
          cif?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          tipo_material?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proveedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_materiales: {
        Row: {
          cantidad: number
          coste_total: number
          created_at: string
          id: string
          material_id: string
          proyecto_id: string
        }
        Insert: {
          cantidad: number
          coste_total: number
          created_at?: string
          id?: string
          material_id: string
          proyecto_id: string
        }
        Update: {
          cantidad?: number
          coste_total?: number
          created_at?: string
          id?: string
          material_id?: string
          proyecto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_materiales_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_materiales_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_empresa_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "trabajador"
      estado_factura: "PAGADA" | "PENDIENTE"
      estado_obra: "Pendiente" | "Aprobado" | "Terminado" | "Rechazado"
      estado_presupuesto: "PENDIENTE" | "ACEPTADO" | "RECHAZADO"
      estado_proyecto:
        | "PENDIENTE"
        | "APROBADO"
        | "EN_PROGRESO"
        | "TERMINADO"
        | "RECHAZADO"
      tipo_evento: "CITA" | "REUNION" | "INICIO_OBRA" | "FIN_OBRA" | "VISITA"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "trabajador"],
      estado_factura: ["PAGADA", "PENDIENTE"],
      estado_obra: ["Pendiente", "Aprobado", "Terminado", "Rechazado"],
      estado_presupuesto: ["PENDIENTE", "ACEPTADO", "RECHAZADO"],
      estado_proyecto: [
        "PENDIENTE",
        "APROBADO",
        "EN_PROGRESO",
        "TERMINADO",
        "RECHAZADO",
      ],
      tipo_evento: ["CITA", "REUNION", "INICIO_OBRA", "FIN_OBRA", "VISITA"],
    },
  },
} as const
