"""
SISTEMA DE GESTIÓN PARA WUASI BOX
Empresa especializada en productos de embalaje
Autor: WUASI Solutions Department
Versión: 3.0 Professional
"""

import os
import json
import csv
from datetime import datetime
from typing import Dict, List, Optional

class SistemaEmbalajes:
    def __init__(self):
        """Inicializa el sistema con configuración profesional"""
        self.archivo_datos = "productos.json"
        self.archivo_log = "sistema_log.txt"
        self.productos = self.cargar_datos()
        self.categorias = [
            "Cintas Transparentes",
            "Envoplast",
            "Cinta Aislante",
            "Cinta de Oficina",
            "Tirro de Papel",
            "Flejes Plásticos",
            "Películas Estirables",
            "Material de Protección"
        ]
        self.unidades_medida = ["Rollos", "Unidades", "Metros", "Kilos", "Cajas"]
        
    def log_accion(self, accion: str, usuario: str = "Sistema"):
        """Registra acciones en el log del sistema"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"{timestamp} | {usuario} | {accion}\n"
        
        try:
            with open(self.archivo_log, 'a', encoding='utf-8') as f:
                f.write(log_entry)
        except:
            pass
    
    def cargar_datos(self) -> List[Dict]:
        """Carga los productos desde el archivo JSON"""
        try:
            if os.path.exists(self.archivo_datos):
                with open(self.archivo_datos, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.log_accion("Datos cargados exitosamente")
                    return data
        except Exception as e:
            self.log_accion(f"Error al cargar datos: {str(e)}")
        return []
    
    def guardar_datos(self) -> bool:
        """Guarda los productos en el archivo JSON"""
        try:
            with open(self.archivo_datos, 'w', encoding='utf-8') as f:
                json.dump(self.productos, f, indent=4, ensure_ascii=False, default=str)
            self.log_accion("Datos guardados exitosamente")
            return True
        except Exception as e:
            self.log_accion(f"Error al guardar datos: {str(e)}")
            return False
    
    def limpiar_pantalla(self):
        """Limpia la pantalla de la consola"""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def mostrar_encabezado(self, titulo: str):
        """Muestra un encabezado profesional"""
        self.limpiar_pantalla()
        print("=" * 70)
        print(f"           BOXPRO SOLUTIONS - {titulo}")
        print("=" * 70)
        print(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        print("-" * 70)
    
    def validar_codigo_producto(self, codigo: str) -> bool:
        """Valida el formato del código de producto (BOX-XXX-XXXX)"""
        if not codigo:
            return False
        
        partes = codigo.split('-')
        if len(partes) != 3:
            return False
        
        if partes[0] != "BOX":
            return False
        
        if not partes[1].isdigit() or len(partes[1]) != 3:
            return False
        
        if not partes[2].isdigit() or len(partes[2]) != 4:
            return False
        
        return True
    
    def generar_codigo_producto(self, categoria: str) -> str:
        """Genera un código único para cada producto basado en categoría"""
        if not self.productos:
            contador = 1
        else:
            contador = max(int(p['codigo'].split('-')[2]) for p in self.productos 
                          if p['codigo'].startswith('BOX')) + 1
        
        # Mapeo de categorías a códigos
        map_categorias = {
            "Cintas Transparentes": "100",
            "Envoplast": "200", 
            "Cinta Aislante": "300",
            "Cinta de Oficina": "400",
            "Tirro de Papel": "500",
            "Flejes Plásticos": "600",
            "Películas Estirables": "700",
            "Material de Protección": "800"
        }
        
        cod_categoria = map_categorias.get(categoria, "999")
        return f"BOX-{cod_categoria}-{contador:04d}"
    
    def introducir_producto(self):
        """Registra un nuevo producto de embalaje"""
        self.mostrar_encabezado("REGISTRO DE PRODUCTOS DE EMBALAJE")
        
        print("\n📦 CATEGORÍAS DE PRODUCTOS:")
        print("-" * 50)
        for i, categoria in enumerate(self.categorias, 1):
            print(f"  {i}. {categoria}")
        print("-" * 50)
        
        # Selección de categoría
        while True:
            try:
                opcion_cat = int(input("\nSeleccione la categoría (1-8): "))
                if 1 <= opcion_cat <= len(self.categorias):
                    categoria = self.categorias[opcion_cat - 1]
                    break
                else:
                    print("⚠️  Seleccione una categoría válida.")
            except ValueError:
                print("⚠️  Ingrese un número válido.")
        
        # Generar código automático
        codigo = self.generar_codigo_producto(categoria)
        print(f"\n✅ Código generado automáticamente: {codigo}")
        
        nuevo_producto = {
            'codigo': codigo,
            'categoria': categoria,
            'fecha_registro': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'estado': 'Activo'
        }
        
        print("\n📝 INGRESE LOS DATOS DEL PRODUCTO:")
        print("-" * 40)
        
        # Datos del producto
        nuevo_producto['nombre'] = input("Nombre del producto: ").strip()
        nuevo_producto['descripcion'] = input("Descripción: ").strip()
        nuevo_producto['marca'] = input("Marca/Fabricante: ").strip()
        
        # Unidad de medida
        print("\n📏 UNIDADES DE MEDIDA:")
        for i, unidad in enumerate(self.unidades_medida, 1):
            print(f"  {i}. {unidad}")
        
        while True:
            try:
                opcion_uni = int(input("\nSeleccione unidad de medida (1-5): "))
                if 1 <= opcion_uni <= len(self.unidades_medida):
                    nuevo_producto['unidad_medida'] = self.unidades_medida[opcion_uni - 1]
                    break
                else:
                    print("⚠️  Seleccione una unidad válida.")
            except ValueError:
                print("⚠️  Ingrese un número válido.")
        
        # Precios y stock
        while True:
            try:
                nuevo_producto['precio_compra'] = float(input("Precio de compra ($): "))
                nuevo_producto['precio_venta'] = float(input("Precio de venta ($): "))
                nuevo_producto['stock'] = int(input("Cantidad en stock: "))
                nuevo_producto['stock_minimo'] = int(input("Stock mínimo (alerta): "))
                break
            except ValueError:
                print("⚠️  Ingrese valores numéricos válidos.")
        
        # Proveedor
        nuevo_producto['proveedor'] = input("Nombre del proveedor: ").strip()
        nuevo_producto['contacto_proveedor'] = input("Contacto del proveedor: ").strip()
        
        # Especificaciones técnicas
        print("\n🔧 ESPECIFICACIONES TÉCNICAS:")
        nuevo_producto['ancho'] = input("Ancho (ej: 48mm): ").strip()
        nuevo_producto['largo'] = input("Largo (ej: 50m): ").strip()
        nuevo_producto['color'] = input("Color: ").strip()
        nuevo_producto['material'] = input("Material principal: ").strip()
        
        # Ubicación en almacén
        nuevo_producto['ubicacion'] = input("Ubicación en almacén (ej: A-12-B3): ").strip()
        
        self.productos.append(nuevo_producto)
        
        if self.guardar_datos():
            print(f"\n🎉 PRODUCTO REGISTRADO EXITOSAMENTE!")
            print(f"📋 Código: {codigo}")
            print(f"📦 Producto: {nuevo_producto['nombre']}")
            print(f"🏷️  Categoría: {categoria}")
            print(f"💰 Margen de ganancia: ${nuevo_producto['precio_venta'] - nuevo_producto['precio_compra']:.2f}")
            self.log_accion(f"Producto registrado: {codigo}", "Usuario")
        else:
            print("\n❌ Error al guardar el producto.")
        
        input("\n⏎ Presione Enter para continuar...")
    
    def buscar_producto(self, buscar_por: str = "", valor: str = "") -> Optional[Dict]:
        """Busca productos por diferentes criterios"""
        if not self.productos:
            print("\n📭 No hay productos registrados.")
            return None
        
        if buscar_por and valor:
            # Búsqueda directa
            for producto in self.productos:
                if buscar_por == 'codigo' and producto['codigo'] == valor:
                    return producto
                elif buscar_por == 'nombre' and valor.lower() in producto['nombre'].lower():
                    return producto
            return None
        
        # Mostrar lista para selección
        print("\n📋 PRODUCTOS REGISTRADOS:")
        print("-" * 90)
        print(f"{'Código':<12} {'Nombre':<25} {'Categoría':<20} {'Stock':<8} {'P.Venta':<10}")
        print("-" * 90)
        
        for producto in self.productos:
            estado_stock = "🟢" if producto['stock'] > producto['stock_minimo'] else "🔴"
            print(f"{producto['codigo']:<12} {producto['nombre'][:23]:<25} "
                  f"{producto['categoria'][:18]:<20} {estado_stock} {producto['stock']:<6} "
                  f"${producto['precio_venta']:<9.2f}")
        
        print("-" * 90)
        
        while True:
            codigo_buscar = input("\nIngrese el código del producto (BOX-XXX-XXXX) o 0 para cancelar: ").strip()
            
            if codigo_buscar == '0':
                return None
            
            if not self.validar_codigo_producto(codigo_buscar):
                print("⚠️  Formato de código inválido. Use: BOX-XXX-XXXX")
                continue
            
            for producto in self.productos:
                if producto['codigo'] == codigo_buscar:
                    return producto
            
            print("❌ Producto no encontrado.")
            continue_buscar = input("¿Desea buscar otro? (S/N): ").lower()
            if continue_buscar != 's':
                return None
    
    def modificar_producto(self):
        """Modifica un producto existente"""
        self.mostrar_encabezado("MODIFICACIÓN DE PRODUCTO")
        
        producto = self.buscar_producto()
        if not producto:
            input("\n⏎ Presione Enter para continuar...")
            return
        
        print(f"\n✏️  MODIFICANDO PRODUCTO:")
        print(f"   Código: {producto['codigo']}")
        print(f"   Nombre: {producto['nombre']}")
        print(f"   Categoría: {producto['categoria']}")
        print("-" * 50)
        
        # Mostrar datos actuales
        print("\n📊 DATOS ACTUALES:")
        for clave, valor in producto.items():
            if clave not in ['codigo', 'fecha_registro']:
                print(f"  {clave.replace('_', ' ').title()}: {valor}")
        
        print("\n🔄 INGRESE LOS NUEVOS VALORES (deje vacío para mantener):")
        
        # Campos editables
        campos_editables = [
            ('nombre', 'Nombre del producto'),
            ('descripcion', 'Descripción'),
            ('marca', 'Marca/Fabricante'),
            ('precio_compra', 'Precio de compra ($)'),
            ('precio_venta', 'Precio de venta ($)'),
            ('stock', 'Cantidad en stock'),
            ('stock_minimo', 'Stock mínimo'),
            ('proveedor', 'Proveedor'),
            ('contacto_proveedor', 'Contacto proveedor'),
            ('ubicacion', 'Ubicación en almacén')
        ]
        
        for campo, descripcion in campos_editables:
            valor_actual = producto.get(campo, '')
            nuevo_valor = input(f"\n{descripcion} [{valor_actual}]: ").strip()
            
            if nuevo_valor:
                if campo in ['precio_compra', 'precio_venta']:
                    try:
                        producto[campo] = float(nuevo_valor)
                    except:
                        print("⚠️  Valor no válido, se mantiene el anterior.")
                elif campo in ['stock', 'stock_minimo']:
                    try:
                        producto[campo] = int(nuevo_valor)
                    except:
                        print("⚠️  Valor no válido, se mantiene el anterior.")
                else:
                    producto[campo] = nuevo_valor
        
        producto['fecha_modificacion'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        producto['modificado_por'] = "Usuario"
        
        if self.guardar_datos():
            print(f"\n✅ PRODUCTO ACTUALIZADO EXITOSAMENTE!")
            self.log_accion(f"Producto modificado: {producto['codigo']}", "Usuario")
        else:
            print("\n❌ Error al guardar los cambios.")
        
        input("\n⏎ Presione Enter para continuar...")
    
    def generar_reporte_inventario(self):
        """Genera reporte detallado del inventario"""
        self.mostrar_encabezado("REPORTE DE INVENTARIO")
        
        if not self.productos:
            print("\n📭 No hay productos registrados.")
            input("\n⏎ Presione Enter para continuar...")
            return
        
        # Estadísticas
        total_productos = len(self.productos)
        valor_total_inventario = 0
        productos_bajo_stock = 0
        categorias_distribucion = {}
        
        print("\n📊 REPORTE DETALLADO DE INVENTARIO")
        print("=" * 120)
        print(f"{'Código':<12} {'Producto':<25} {'Categoría':<20} {'U.Med':<8} "
              f"{'P.Compra':<10} {'P.Venta':<10} {'Stock':<8} {'Valor':<12} {'Estado':<10}")
        print("=" * 120)
        
        for producto in self.productos:
            valor_producto = producto['precio_compra'] * producto['stock']
            valor_total_inventario += valor_producto
            
            # Contar por categoría
            cat = producto['categoria']
            categorias_distribucion[cat] = categorias_distribucion.get(cat, 0) + 1
            
            # Estado del stock
            if producto['stock'] == 0:
                estado = "AGOTADO 🔴"
                productos_bajo_stock += 1
            elif producto['stock'] <= producto['stock_minimo']:
                estado = "BAJO 🟡"
                productos_bajo_stock += 1
            else:
                estado = "NORMAL 🟢"
            
            margen = producto['precio_venta'] - producto['precio_compra']
            
            print(f"{producto['codigo']:<12} {producto['nombre'][:23]:<25} "
                  f"{producto['categoria'][:18]:<20} {producto.get('unidad_medida', 'N/A'):<8} "
                  f"${producto['precio_compra']:<9.2f} ${producto['precio_venta']:<9.2f} "
                  f"{producto['stock']:<8} ${valor_producto:<11.2f} {estado:<10}")
        
        print("=" * 120)
        
        # Resumen ejecutivo
        print(f"\n📈 RESUMEN EJECUTIVO:")
        print(f"   • Total de productos: {total_productos}")
        print(f"   • Valor total del inventario: ${valor_total_inventario:,.2f}")
        print(f"   • Productos con stock bajo/crítico: {productos_bajo_stock}")
        print(f"   • Margen de ganancia promedio: {self.calcular_margen_promedio():.1f}%")
        
        print(f"\n📦 DISTRIBUCIÓN POR CATEGORÍA:")
        for categoria, cantidad in categorias_distribucion.items():
            porcentaje = (cantidad / total_productos) * 100
            barra = "█" * int(porcentaje / 2)
            print(f"   {categoria[:15]:<15} [{barra:<50}] {cantidad:>3} ({porcentaje:.1f}%)")
        
        print(f"\n📅 Fecha del reporte: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        print(f"💾 Los datos se guardan automáticamente en '{self.archivo_datos}'")
        
        # Opción para exportar
        exportar = input("\n¿Desea exportar este reporte a CSV? (S/N): ").lower()
        if exportar == 's':
            self.exportar_reporte_csv()
        
        input("\n⏎ Presione Enter para continuar...")
    
    def calcular_margen_promedio(self) -> float:
        """Calcula el margen de ganancia promedio"""
        if not self.productos:
            return 0
        
        margenes = []
        for producto in self.productos:
            if producto['precio_compra'] > 0:
                margen = ((producto['precio_venta'] - producto['precio_compra']) / 
                         producto['precio_compra']) * 100
                margenes.append(margen)
        
        return sum(margenes) / len(margenes) if margenes else 0
    
    def exportar_reporte_csv(self):
        """Exporta el inventario a archivo CSV"""
        if not self.productos:
            print("\n📭 No hay productos para exportar.")
            return
        
        fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
        nombre_archivo = f"reporte_inventario_{fecha_actual}.csv"
        
        try:
            with open(nombre_archivo, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                
                # Encabezados
                writer.writerow(['REPORTE DE INVENTARIO - BOXPRO SOLUTIONS'])
                writer.writerow([f'Fecha de generación: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}'])
                writer.writerow([])
                writer.writerow([
                    'Código', 'Nombre', 'Categoría', 'Unidad Medida', 'Precio Compra',
                    'Precio Venta', 'Stock', 'Stock Mínimo', 'Valor Inventario',
                    'Proveedor', 'Ubicación', 'Estado'
                ])
                
                # Datos
                for producto in self.productos:
                    valor_inventario = producto['precio_compra'] * producto['stock']
                    estado = "NORMAL" if producto['stock'] > producto['stock_minimo'] else "BAJO"
                    estado = "AGOTADO" if producto['stock'] == 0 else estado
                    
                    writer.writerow([
                        producto['codigo'],
                        producto['nombre'],
                        producto['categoria'],
                        producto.get('unidad_medida', 'N/A'),
                        producto['precio_compra'],
                        producto['precio_venta'],
                        producto['stock'],
                        producto['stock_minimo'],
                        valor_inventario,
                        producto.get('proveedor', 'N/A'),
                        producto.get('ubicacion', 'N/A'),
                        estado
                    ])
                
                # Totales
                writer.writerow([])
                total_valor = sum(p['precio_compra'] * p['stock'] for p in self.productos)
                writer.writerow(['', '', '', '', '', '', '', 'TOTAL INVENTARIO:', f'${total_valor:.2f}'])
            
            print(f"\n✅ Reporte exportado exitosamente a '{nombre_archivo}'")
            self.log_accion(f"Reporte exportado: {nombre_archivo}", "Sistema")
            
        except Exception as e:
            print(f"\n❌ Error al exportar: {e}")
    
    def mostrar_alerta_stock(self):
        """Muestra productos con stock bajo"""
        productos_bajo_stock = [
            p for p in self.productos 
            if p['stock'] <= p['stock_minimo']
        ]
        
        if not productos_bajo_stock:
            return
        
        print("\n⚠️  ALERTAS DE STOCK BAJO:")
        print("-" * 80)
        print(f"{'Código':<12} {'Producto':<25} {'Stock Actual':<12} {'Stock Mínimo':<12} {'Diferencia':<12}")
        print("-" * 80)
        
        for producto in productos_bajo_stock:
            diferencia = producto['stock'] - producto['stock_minimo']
            print(f"{producto['codigo']:<12} {producto['nombre'][:23]:<25} "
                  f"{producto['stock']:<12} {producto['stock_minimo']:<12} {diferencia:<12}")
        
        print("-" * 80)
    
    def menu_principal(self):
        """Menú principal del sistema"""
        while True:
            self.mostrar_encabezado("SISTEMA DE GESTIÓN")
            
            # Mostrar alertas si existen
            self.mostrar_alerta_stock()
            
            print("\n📱 MENÚ PRINCIPAL:")
            print("   1. 📦 Registrar nuevo producto de embalaje")
            print("   2. ✏️  Modificar producto existente")
            print("   3. 📊 Generar reporte de inventario")
            print("   4. 🔍 Buscar producto por código")
            print("   5. 📈 Estadísticas de ventas")
            print("   6. 🖨️  Exportar datos a Excel")
            print("   7. 📋 Ver log del sistema")
            print("   8. 🚪 Salir del sistema")
            print("-" * 70)
            
            try:
                opcion = int(input("\nSeleccione una opción (1-8): "))
                
                if opcion == 1:
                    self.introducir_producto()
                elif opcion == 2:
                    self.modificar_producto()
                elif opcion == 3:
                    self.generar_reporte_inventario()
                elif opcion == 4:
                    self.buscar_producto_interactivo()
                elif opcion == 5:
                    self.mostrar_estadisticas()
                elif opcion == 6:
                    self.exportar_reporte_csv()
                elif opcion == 7:
                    self.ver_log_sistema()
                elif opcion == 8:
                    print("\n👋 ¡Gracias por usar el sistema BoxPro Solutions!")
                    print("   Sistema desarrollado para gestión profesional de embalajes.")
                    break
                else:
                    print("⚠️  Opción no válida. Intente nuevamente.")
                    input("\n⏎ Presione Enter para continuar...")
                    
            except ValueError:
                print("⚠️  Ingrese un número válido.")
                input("\n⏎ Presione Enter para continuar...")
    
    def buscar_producto_interactivo(self):
        """Búsqueda interactiva de productos"""
        self.mostrar_encabezado("BÚSQUEDA DE PRODUCTOS")
        
        print("\n🔍 MÉTODOS DE BÚSQUEDA:")
        print("   1. Por código de producto")
        print("   2. Por nombre")
        print("   3. Por categoría")
        print("   4. Por proveedor")
        print("-" * 50)
        
        try:
            metodo = int(input("\nSeleccione método de búsqueda (1-4): "))
            
            if metodo == 1:
                codigo = input("Ingrese código (BOX-XXX-XXXX): ").strip()
                producto = self.buscar_producto('codigo', codigo)
            elif metodo == 2:
                nombre = input("Ingrese nombre o parte del nombre: ").strip()
                producto = self.buscar_producto('nombre', nombre)
            else:
                print("Funcionalidad en desarrollo...")
                input("\n⏎ Presione Enter para continuar...")
                return
            
            if producto:
                self.mostrar_detalle_producto(producto)
            else:
                print("\n❌ Producto no encontrado.")
                
        except ValueError:
            print("⚠️  Opción no válida.")
        
        input("\n⏎ Presione Enter para continuar...")
    
    def mostrar_detalle_producto(self, producto: Dict):
        """Muestra el detalle completo de un producto"""
        print(f"\n📄 DETALLE COMPLETO DEL PRODUCTO:")
        print("=" * 60)
        print(f"Código:           {producto['codigo']}")
        print(f"Nombre:           {producto['nombre']}")
        print(f"Categoría:        {producto['categoria']}")
        print(f"Descripción:      {producto.get('descripcion', 'N/A')}")
        print(f"Marca:            {producto.get('marca', 'N/A')}")
        print(f"Unidad de medida: {producto.get('unidad_medida', 'N/A')}")
        print(f"Precio compra:    ${producto.get('precio_compra', 0):.2f}")
        print(f"Precio venta:     ${producto.get('precio_venta', 0):.2f}")
        print(f"Stock actual:     {producto.get('stock', 0)}")
        print(f"Stock mínimo:     {producto.get('stock_minimo', 0)}")
        print(f"Proveedor:        {producto.get('proveedor', 'N/A')}")
        print(f"Contacto:         {producto.get('contacto_proveedor', 'N/A')}")
        print(f"Ubicación:        {producto.get('ubicacion', 'N/A')}")
        print(f"Fecha registro:   {producto.get('fecha_registro', 'N/A')}")
        
        margen = producto.get('precio_venta', 0) - producto.get('precio_compra', 0)
        print(f"Margen unitario:  ${margen:.2f}")
        
        valor_inventario = producto.get('precio_compra', 0) * producto.get('stock', 0)
        print(f"Valor en inventario: ${valor_inventario:.2f}")
        print("=" * 60)
    
    def mostrar_estadisticas(self):
        """Muestra estadísticas del sistema"""
        self.mostrar_encabezado("ESTADÍSTICAS DEL SISTEMA")
        
        if not self.productos:
            print("\n📭 No hay datos para mostrar estadísticas.")
            input("\n⏎ Presione Enter para continuar...")
            return
        
        total_productos = len(self.productos)
        valor_total_inventario = sum(p['precio_compra'] * p['stock'] for p in self.productos)
        productos_bajo_stock = len([p for p in self.productos if p['stock'] <= p['stock_minimo']])
        
        print("\n📊 ESTADÍSTICAS GENERALES:")
        print(f"   • Total de productos registrados: {total_productos}")
        print(f"   • Valor total del inventario: ${valor_total_inventario:,.2f}")
        print(f"   • Productos con stock bajo: {productos_bajo_stock}")
        print(f"   • Margen de ganancia promedio: {self.calcular_margen_promedio():.1f}%")
        
        # Estadísticas por categoría
        print("\n📦 ESTADÍSTICAS POR CATEGORÍA:")
        categorias = {}
        for producto in self.productos:
            cat = producto['categoria']
            if cat not in categorias:
                categorias[cat] = {'cantidad': 0, 'valor': 0}
            categorias[cat]['cantidad'] += 1
            categorias[cat]['valor'] += producto['precio_compra'] * producto['stock']
        
        for categoria, datos in categorias.items():
            porcentaje = (datos['cantidad'] / total_productos) * 100
            print(f"   • {categoria}: {datos['cantidad']} productos ({porcentaje:.1f}%) - "
                  f"Valor: ${datos['valor']:,.2f}")
        
        input("\n⏎ Presione Enter para continuar...")
    
    def ver_log_sistema(self):
        """Muestra el log del sistema"""
        self.mostrar_encabezado("LOG DEL SISTEMA")
        
        try:
            if os.path.exists(self.archivo_log):
                with open(self.archivo_log, 'r', encoding='utf-8') as f:
                    lineas = f.readlines()
                
                if lineas:
                    print("\nÚLTIMAS 20 ACCIONES:")
                    print("-" * 80)
                    for linea in lineas[-20:]:
                        print(linea.strip())
                    print("-" * 80)
                    print(f"Total de registros: {len(lineas)}")
                else:
                    print("\n📭 El log del sistema está vacío.")
            else:
                print("\n📭 El archivo de log no existe aún.")
                
        except Exception as e:
            print(f"\n❌ Error al leer el log: {e}")
        
        input("\n⏎ Presione Enter para continuar...")


# Punto de entrada del programa
if __name__ == "__main__":
    print("=" * 70)
    print("        BOXPRO SOLUTIONS - SISTEMA DE GESTIÓN")
    print("        Especialistas en productos de embalaje")
    print("=" * 70)
    print("   Inicializando sistema...")
    
    sistema = SistemaEmbalajes()
    
    # Cargar datos de ejemplo si no hay productos
    if not sistema.productos:
        print("   Cargando datos iniciales de ejemplo...")
        # Datos de ejemplo para pruebas
        datos_ejemplo = [
            {
                'codigo': 'BOX-100-0001',
                'nombre': 'Cinta Transparente 48mm x 50m',
                'categoria': 'Cintas Transparentes',
                'descripcion': 'Cinta adhesiva transparente para embalaje',
                'marca': '3M',
                'unidad_medida': 'Rollos',
                'precio_compra': 2.50,
                'precio_venta': 4.99,
                'stock': 150,
                'stock_minimo': 20,
                'proveedor': 'Distribuidora Central',
                'contacto_proveedor': 'Juan Pérez - 555-1234',
                'ancho': '48mm',
                'largo': '50m',
                'color': 'Transparente',
                'material': 'Polipropileno',
                'ubicacion': 'A-01-01',
                'fecha_registro': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'estado': 'Activo'
            },
            {
                'codigo': 'BOX-200-0001',
                'nombre': 'Envoplast Industrial 20 micras',
                'categoria': 'Envoplast',
                'descripcion': 'Película estirable para pallets',
                'marca': 'StretchPro',
                'unidad_medida': 'Rollos',
                'precio_compra': 45.00,
                'precio_venta': 89.99,
                'stock': 25,
                'stock_minimo': 5,
                'proveedor': 'Plásticos Industriales SA',
                'contacto_proveedor': 'María García - 555-5678',
                'ancho': '500mm',
                'largo': '1500m',
                'color': 'Transparente',
                'material': 'Polietileno',
                'ubicacion': 'B-02-03',
                'fecha_registro': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'estado': 'Activo'
            }
        ]
        sistema.productos = datos_ejemplo
        sistema.guardar_datos()
    
    print("   Sistema listo. Presione Enter para continuar...")
    input()
    
    sistema.menu_principal()