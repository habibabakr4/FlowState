# instruction argu

# the base image (image is created from another image) -> runtime
FROM php:8.4-fpm

# the directory inside the container where the appliction will live and the all instructions will run on it
WORKDIR /app

COPY . /app

# shell foramt command run in top of current image(during the build of image)
RUN composer install

#exec fromat
CMD ["php-fpm"]