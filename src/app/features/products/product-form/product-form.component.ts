import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  form: FormGroup;
  idProducto: number | null = null;
  fotoSeleccionada: File | null = null;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.1)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    })
  }


  ngOnInit(): void {
  this.idProducto = Number(this.route.snapshot.paramMap.get('id'));
  if (this.idProducto) {
    this.productoService.getProductoById(this.idProducto).subscribe(p => {
      this.form.patchValue(p)
    })
  }
}
onFileSelected(event: any) {
  this.fotoSeleccionada = event.target.files[0];
}

guardar() {
  if (this.form.invalid) return;
    const formData = new FormData();
    formData.append('nombre', this.form.value.nombre);
    formData.append('descripcion', this.form.value.descripcion);
    formData.append('precio', this.form.value.precio);
    formData.append('stock', this.form.value.stock);

    if (this.fotoSeleccionada) {
      formData.append('file', this.fotoSeleccionada);
    }
    const request = this.idProducto 
    ? this.productoService.actualizarProducto(this.idProducto, formData) 
    : this.productoService.crearProducto(formData)
    request.subscribe({
      next: () => {
        this.alertService.success(this.idProducto ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
        this.router.navigate(['/productos']);
      }, error: (err) => this.alertService.error('Error al guardar el producto')
      
    });

  }
}


